import type { Env } from '../types/env'

export class UserFeed {
  readonly ctx: DurableObjectState
  readonly env: Env

  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // Internal push endpoint: POST /push — broadcasts an event to all connected WS clients
    if (request.method === 'POST' && url.pathname.endsWith('/push')) {
      const event = await request.json<object>()
      this.broadcast(event)
      return new Response('OK', { status: 200 })
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 })
    }

    const userId = url.searchParams.get('user_id') ?? 'unknown'

    const { 0: client, 1: server } = new WebSocketPair()
    server.serializeAttachment({ userId })
    this.ctx.acceptWebSocket(server)

    return new Response(null, { status: 101, webSocket: client })
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message !== 'string') return
    try {
      const data = JSON.parse(message) as { type: string }
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }))
      }
    } catch {
      // Ignore malformed messages
    }
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void {
    ws.close(code, reason)
  }

  webSocketError(ws: WebSocket): void {
    ws.close(1011, 'WebSocket error')
  }

  // Called from the Worker to push events to all connected clients for this user
  broadcast(event: object): void {
    const message = JSON.stringify(event)
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(message)
      } catch {
        // Connection already closed — runtime will evict it
      }
    }
  }
}
