import type { Env } from '../types/env'

interface WSAttachment {
  userId: string
  username: string
  conversationId: string
  userA: string
  userB: string
}

export class ChatRoom {
  readonly ctx: DurableObjectState
  readonly env: Env

  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 })
    }

    const userId = url.searchParams.get('user_id') ?? 'unknown'
    const username = url.searchParams.get('username') ?? userId
    const conversationId = url.searchParams.get('conversation_id') ?? ''
    const userA = url.searchParams.get('user_a') ?? ''
    const userB = url.searchParams.get('user_b') ?? ''

    const { 0: client, 1: server } = new WebSocketPair()
    server.serializeAttachment({ userId, username, conversationId, userA, userB })
    this.ctx.acceptWebSocket(server)

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return

    const att = ws.deserializeAttachment() as WSAttachment
    const { userId, username, conversationId, userA, userB } = att
    const recipientId = userA === userId ? userB : userA

    let data: Record<string, unknown>
    try {
      data = JSON.parse(message) as Record<string, unknown>
    } catch {
      return
    }

    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }))
        break

      case 'message': {
        const content = ((data.content as string | undefined) ?? '').trim()
        if (!content) return

        const msgId = crypto.randomUUID()
        const sentAt = Date.now()
        const msgType = (data.msg_type as string | undefined) ?? 'text'
        const metadata =
          data.metadata != null ? JSON.stringify(data.metadata) : null

        await this.env.DB.prepare(
          `INSERT INTO messages (id, conversation_id, sender_id, content, type, metadata, sent_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(msgId, conversationId, userId, content, msgType, metadata, sentAt)
          .run()

        const preview = content.slice(0, 60)
        await this.env.DB.prepare(
          `UPDATE conversations SET last_message_at = ?, last_message_preview = ? WHERE id = ?`,
        )
          .bind(sentAt, preview, conversationId)
          .run()

        const outbound = JSON.stringify({
          type: 'message',
          message: {
            id: msgId,
            sender_id: userId,
            content,
            type: msgType,
            metadata: data.metadata ?? null,
            sent_at: sentAt,
            reactions: [],
          },
        })

        for (const client of this.ctx.getWebSockets()) {
          try {
            client.send(outbound)
          } catch {}
        }

        // Notify recipient via UserFeed if not connected here
        const recipientConnected = this.ctx.getWebSockets().some((w) => {
          const a = w.deserializeAttachment() as WSAttachment
          return a.userId === recipientId
        })

        if (!recipientConnected) {
          await this.pushToUserFeed(recipientId, {
            type: 'new_message',
            from_user_id: userId,
            from_username: username,
            preview: content.slice(0, 40),
            conversation_id: conversationId,
          })
        }
        break
      }

      case 'typing': {
        const isTyping = Boolean(data.is_typing)
        for (const client of this.ctx.getWebSockets()) {
          const a = client.deserializeAttachment() as WSAttachment
          if (a.userId !== userId) {
            try {
              client.send(
                JSON.stringify({ type: 'typing', user_id: userId, is_typing: isTyping }),
              )
            } catch {}
          }
        }
        break
      }

      case 'read': {
        const messageId = data.message_id as string | undefined
        if (!messageId) return
        const readAt = Date.now()
        await this.env.DB.prepare(
          `UPDATE messages SET read_at = ? WHERE id = ? AND sender_id != ?`,
        )
          .bind(readAt, messageId, userId)
          .run()
        const readMsg = JSON.stringify({ type: 'read', message_id: messageId, read_at: readAt })
        for (const client of this.ctx.getWebSockets()) {
          const a = client.deserializeAttachment() as WSAttachment
          if (a.userId !== userId) {
            try {
              client.send(readMsg)
            } catch {}
          }
        }
        break
      }

      case 'react': {
        const messageId = data.message_id as string | undefined
        const emoji = data.emoji as string | undefined
        if (!messageId || !emoji) return
        await this.env.DB.prepare(
          `INSERT OR REPLACE INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)`,
        )
          .bind(messageId, userId, emoji)
          .run()
        const reactionMsg = JSON.stringify({
          type: 'reaction',
          message_id: messageId,
          user_id: userId,
          emoji,
        })
        for (const client of this.ctx.getWebSockets()) {
          try {
            client.send(reactionMsg)
          } catch {}
        }
        break
      }
    }
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void {
    ws.close(code, reason)
  }

  webSocketError(ws: WebSocket): void {
    ws.close(1011, 'WebSocket error')
  }

  private async pushToUserFeed(userId: string, event: object): Promise<void> {
    try {
      const doId = this.env.USER_FEED.idFromName(userId)
      const stub = this.env.USER_FEED.get(doId)
      await stub.fetch(
        new Request('https://internal/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        }),
      )
    } catch {}
  }
}
