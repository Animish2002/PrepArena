import { Hono } from 'hono'
import { and, eq, lt, or, desc } from 'drizzle-orm'
import { getDb } from '../db'
import {
  conversations,
  friendships,
  messages,
  messageReactions,
  problems,
  users,
} from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

const router = new Hono<AppEnv>()

// ── GET /chat/conversations ────────────────────────────────────────────────────

router.get('/conversations', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const convs = await db
    .select()
    .from(conversations)
    .where(or(eq(conversations.userA, userId), eq(conversations.userB, userId)))
    .orderBy(desc(conversations.lastMessageAt))

  const result = await Promise.all(
    convs.map(async (conv) => {
      const otherId = conv.userA === userId ? conv.userB : conv.userA

      const [other] = await db
        .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
        .from(users)
        .where(eq(users.id, otherId))
        .limit(1)

      const unreadResult = await c.env.DB.prepare(
        `SELECT COUNT(*) as cnt FROM messages
         WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL`,
      )
        .bind(conv.id, userId)
        .first<{ cnt: number }>()

      return {
        id: conv.id,
        other_user: other ?? { id: otherId, name: 'Unknown', username: '', avatarUrl: null },
        last_message_preview: conv.lastMessagePreview,
        last_message_at: conv.lastMessageAt,
        unread_count: unreadResult?.cnt ?? 0,
      }
    }),
  )

  return c.json({ conversations: result })
})

// ── GET /chat/with/:friendId — get or create conversation ─────────────────────

router.get('/with/:friendId', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const friendId = c.req.param('friendId')
  const db = getDb(c.env)

  // Validate friendship
  const [friendship] = await db
    .select({ id: friendships.id })
    .from(friendships)
    .where(
      and(
        or(
          and(eq(friendships.userA, userId), eq(friendships.userB, friendId)),
          and(eq(friendships.userA, friendId), eq(friendships.userB, userId)),
        ),
        eq(friendships.status, 'accepted'),
      ),
    )
    .limit(1)

  if (!friendship) return c.json({ error: 'Not friends' }, 403)

  const [userA, userB] = [userId, friendId].sort()

  const existing = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.userA, userA), eq(conversations.userB, userB)))
    .limit(1)

  if (existing[0]) {
    return c.json({ conversation_id: existing[0].id })
  }

  const convId = crypto.randomUUID()
  const now = Date.now()
  await db.insert(conversations).values({ id: convId, userA, userB, createdAt: now })

  return c.json({ conversation_id: convId })
})

// ── GET /chat/conversations/:conversationId/messages ──────────────────────────

router.get('/conversations/:conversationId/messages', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const conversationId = c.req.param('conversationId')
  const beforeId = c.req.query('before')
  const limit = Math.min(parseInt(c.req.query('limit') ?? '40', 10), 100)
  const db = getDb(c.env)

  // Validate participant
  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.userA, userId), eq(conversations.userB, userId)),
      ),
    )
    .limit(1)

  if (!conv) return c.json({ error: 'Not found' }, 404)

  let query = db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .$dynamic()

  if (beforeId) {
    const [cursor] = await db
      .select({ sentAt: messages.sentAt })
      .from(messages)
      .where(eq(messages.id, beforeId))
      .limit(1)
    if (cursor) {
      query = query.where(
        and(eq(messages.conversationId, conversationId), lt(messages.sentAt, cursor.sentAt)),
      )
    }
  }

  const rows = await query.orderBy(desc(messages.sentAt)).limit(limit)
  const ordered = rows.reverse()

  // Fetch reactions for all messages
  const msgIds = ordered.map((m) => m.id)
  let reactionsMap: Record<string, Array<{ emoji: string; userId: string }>> = {}

  if (msgIds.length > 0) {
    const placeholders = msgIds.map(() => '?').join(',')
    const reactions = await c.env.DB.prepare(
      `SELECT message_id, user_id, emoji FROM message_reactions WHERE message_id IN (${placeholders})`,
    )
      .bind(...msgIds)
      .all<{ message_id: string; user_id: string; emoji: string }>()

    for (const r of reactions.results) {
      if (!reactionsMap[r.message_id]) reactionsMap[r.message_id] = []
      reactionsMap[r.message_id].push({ emoji: r.emoji, userId: r.user_id })
    }
  }

  // Bulk mark unread messages as read
  if (ordered.length > 0) {
    const now = Date.now()
    await c.env.DB.prepare(
      `UPDATE messages SET read_at = ? WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL`,
    )
      .bind(now, conversationId, userId)
      .run()
  }

  const result = ordered.map((m) => ({
    id: m.id,
    conversation_id: m.conversationId,
    sender_id: m.senderId,
    content: m.content,
    type: m.type,
    metadata: m.metadata ? (JSON.parse(m.metadata) as unknown) : null,
    sent_at: m.sentAt,
    read_at: m.readAt,
    reactions: reactionsMap[m.id] ?? [],
  }))

  return c.json({ messages: result })
})

// ── GET /chat/conversations/:conversationId/ws ────────────────────────────────

router.get('/conversations/:conversationId/ws', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const conversationId = c.req.param('conversationId')
  const db = getDb(c.env)

  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.userA, userId), eq(conversations.userB, userId)),
      ),
    )
    .limit(1)

  if (!conv) return c.json({ error: 'Not authorized' }, 403)

  const [me] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const doId = c.env.CHAT_ROOM.idFromName(`chat:${conversationId}`)
  const stub = c.env.CHAT_ROOM.get(doId)

  const url = new URL(c.req.url)
  url.searchParams.set('user_id', userId)
  url.searchParams.set('username', me?.username ?? userId)
  url.searchParams.set('conversation_id', conversationId)
  url.searchParams.set('user_a', conv.userA)
  url.searchParams.set('user_b', conv.userB)

  return stub.fetch(new Request(url.toString(), c.req.raw))
})

// ── GET /chat/unread-count ─────────────────────────────────────────────────────

router.get('/unread-count', authMiddleware, async (c) => {
  const userId = c.get('userId')

  const result = await c.env.DB.prepare(
    `SELECT COUNT(*) as total FROM messages m
     JOIN conversations cv ON cv.id = m.conversation_id
     WHERE (cv.user_a = ? OR cv.user_b = ?)
       AND m.sender_id != ?
       AND m.read_at IS NULL`,
  )
    .bind(userId, userId, userId)
    .first<{ total: number }>()

  return c.json({ total_unread: result?.total ?? 0 })
})

// ── POST /chat/conversations/:conversationId/share-problem ────────────────────

router.post('/conversations/:conversationId/share-problem', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const conversationId = c.req.param('conversationId')
  const db = getDb(c.env)

  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.userA, userId), eq(conversations.userB, userId)),
      ),
    )
    .limit(1)

  if (!conv) return c.json({ error: 'Not found' }, 404)

  const body = await c.req.json<{ problem_id: string }>()
  const [problem] = await db
    .select()
    .from(problems)
    .where(eq(problems.id, body.problem_id))
    .limit(1)

  if (!problem) return c.json({ error: 'Problem not found' }, 404)

  const msgId = crypto.randomUUID()
  const sentAt = Date.now()
  const metadata = JSON.stringify({
    problem_id: problem.id,
    problem_title: problem.title,
    difficulty: problem.difficulty,
    topic: problem.topic,
    platform_link: problem.platformLink,
  })
  const content = `Check out this problem: ${problem.title}`

  await c.env.DB.prepare(
    `INSERT INTO messages (id, conversation_id, sender_id, content, type, metadata, sent_at)
     VALUES (?, ?, ?, ?, 'problem_share', ?, ?)`,
  )
    .bind(msgId, conversationId, userId, content, metadata, sentAt)
    .run()

  await c.env.DB.prepare(
    `UPDATE conversations SET last_message_at = ?, last_message_preview = ? WHERE id = ?`,
  )
    .bind(sentAt, content.slice(0, 60), conversationId)
    .run()

  // Broadcast via ChatRoom DO
  const doId = c.env.CHAT_ROOM.idFromName(`chat:${conversationId}`)
  const stub = c.env.CHAT_ROOM.get(doId)
  const [me] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  await stub.fetch(
    new Request(`https://internal/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'message',
        message: {
          id: msgId,
          sender_id: userId,
          content,
          type: 'problem_share',
          metadata: JSON.parse(metadata) as unknown,
          sent_at: sentAt,
          reactions: [],
        },
      }),
    }),
  ).catch(() => null)

  // Notify recipient via UserFeed
  const recipientId = conv.userA === userId ? conv.userB : conv.userA
  const feedDoId = c.env.USER_FEED.idFromName(recipientId)
  const feedStub = c.env.USER_FEED.get(feedDoId)
  await feedStub
    .fetch(
      new Request('https://internal/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_message',
          from_user_id: userId,
          from_username: me?.username ?? userId,
          preview: `📎 ${problem.title}`,
          conversation_id: conversationId,
        }),
      }),
    )
    .catch(() => null)

  return c.json({ message_id: msgId })
})

// ── POST /internal/chat/messages ──────────────────────────────────────────────

const internalRouter = new Hono<AppEnv>()

internalRouter.post('/messages', async (c) => {
  const key = c.req.header('x-internal-key')
  if (!key || key !== c.env.INTERNAL_KEY) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json<{
    conversation_id: string
    sender_id: string
    content: string
    type: string
    metadata: string | null
    sent_at: number
  }>()

  const msgId = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO messages (id, conversation_id, sender_id, content, type, metadata, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(msgId, body.conversation_id, body.sender_id, body.content, body.type, body.metadata, body.sent_at)
    .run()

  const preview = body.content.slice(0, 60)
  await c.env.DB.prepare(
    `UPDATE conversations SET last_message_at = ?, last_message_preview = ? WHERE id = ?`,
  )
    .bind(body.sent_at, preview, body.conversation_id)
    .run()

  return c.json({ message_id: msgId })
})

export { internalRouter as internalChatRouter }
export default router
