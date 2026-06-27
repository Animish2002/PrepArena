import { Hono } from 'hono'
import { and, desc, eq, inArray, or } from 'drizzle-orm'
import { getDb } from '../db'
import { activityLog, friendships, users } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

const router = new Hono<AppEnv>()

// ─── GET /feed/ws ─────────────────────────────────────────────────────────────

router.get('/ws', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const doId = c.env.USER_FEED.idFromName(userId)
  const stub = c.env.USER_FEED.get(doId)

  // Forward the WebSocket upgrade to the UserFeed DO for this user
  const url = new URL(c.req.url)
  url.searchParams.set('user_id', userId)

  return stub.fetch(new Request(url.toString(), c.req.raw))
})

// ─── GET /feed ────────────────────────────────────────────────────────────────

router.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const accepted = await db
    .select({ userA: friendships.userA, userB: friendships.userB })
    .from(friendships)
    .where(
      and(
        or(eq(friendships.userA, userId), eq(friendships.userB, userId)),
        eq(friendships.status, 'accepted'),
      ),
    )

  const friendIds = accepted.map((f) => (f.userA === userId ? f.userB : f.userA))

  if (friendIds.length === 0) return c.json({ entries: [] })

  const entries = await db
    .select({
      id: activityLog.id,
      type: activityLog.type,
      payload: activityLog.payload,
      createdAt: activityLog.createdAt,
      userId: users.id,
      username: users.username,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(activityLog)
    .innerJoin(users, eq(activityLog.userId, users.id))
    .where(inArray(activityLog.userId, friendIds))
    .orderBy(desc(activityLog.createdAt))
    .limit(50)

  return c.json({ entries })
})

export default router
