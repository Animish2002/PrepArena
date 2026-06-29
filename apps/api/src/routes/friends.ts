import { Hono } from 'hono'
import { and, count, desc, eq, gt, like, or } from 'drizzle-orm'
import { getDb } from '../db'
import type { DB } from '../db'
import { activityLog, friendInvites, friendships, problems, userProgress, userXp, users } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

const router = new Hono<AppEnv>()

router.use('*', authMiddleware)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY = 86_400_000

async function getStreak(db: DB, userId: string): Promise<number> {
  const now = Date.now()
  const rows = await db
    .select({ createdAt: activityLog.createdAt })
    .from(activityLog)
    .where(and(eq(activityLog.userId, userId), eq(activityLog.type, 'solved')))

  if (rows.length === 0) return 0

  const daySet = new Set(rows.map((r) => Math.floor((r.createdAt ?? 0) / DAY)))
  const sorted = [...daySet].sort((a, b) => b - a)

  const today = Math.floor(now / DAY)
  if (sorted[0] < today - 1) return 0

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] - 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function weekStart(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d.getTime()
}

async function broadcastToUser(env: AppEnv['Bindings'], targetUserId: string, event: object) {
  try {
    const doId = env.USER_FEED.idFromName(targetUserId)
    const stub = env.USER_FEED.get(doId)
    await stub.fetch(new Request('https://internal/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }))
  } catch {
    // DO may not be active — non-fatal
  }
}

// ─── POST /friends/invite ─────────────────────────────────────────────────────

router.post('/invite', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)
  const token = crypto.randomUUID()
  const now = Date.now()

  await db.insert(friendInvites).values({
    id: crypto.randomUUID(),
    senderId: userId,
    token,
    expiresAt: now + 7 * DAY,
    used: 0,
  })

  return c.json({ invite_link: `${c.env.FRONTEND_URL}/join/${token}` })
})

// ─── GET /friends/join/:token ─────────────────────────────────────────────────

router.get('/join/:token', async (c) => {
  const userId = c.get('userId')
  const token = c.req.param('token')
  const db = getDb(c.env)
  const now = Date.now()

  const [invite] = await db
    .select()
    .from(friendInvites)
    .where(eq(friendInvites.token, token))
    .limit(1)

  if (!invite) return c.json({ error: 'Invalid invite link' }, 404)
  if (invite.used === 1) return c.json({ error: 'Invite already used' }, 400)
  if ((invite.expiresAt ?? 0) < now) return c.json({ error: 'Invite expired' }, 400)
  if (invite.senderId === userId) return c.json({ error: 'Cannot invite yourself' }, 400)

  const [existing] = await db
    .select({ id: friendships.id, status: friendships.status })
    .from(friendships)
    .where(
      or(
        and(eq(friendships.userA, invite.senderId), eq(friendships.userB, userId)),
        and(eq(friendships.userA, userId), eq(friendships.userB, invite.senderId)),
      ),
    )
    .limit(1)

  let friendshipId: string
  if (!existing) {
    friendshipId = crypto.randomUUID()
    await db.insert(friendships).values({
      id: friendshipId,
      userA: invite.senderId,
      userB: userId,
      status: 'pending',
      createdAt: now,
    })
  } else {
    friendshipId = existing.id
  }

  await db.update(friendInvites).set({ used: 1 }).where(eq(friendInvites.id, invite.id))

  const [sender] = await db
    .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, invite.senderId))
    .limit(1)

  const [[solvedRow]] = await Promise.all([
    db
      .select({ count: count() })
      .from(userProgress)
      .where(and(eq(userProgress.userId, invite.senderId), eq(userProgress.status, 'solved'))),
  ])

  return c.json({
    success: true,
    sender: sender ? { ...sender, solved: solvedRow?.count ?? 0 } : null,
    alreadyFriends: existing?.status === 'accepted',
    friendshipId,
  })
})

// ─── POST /friends/accept/:friendshipId ──────────────────────────────────────

router.post('/accept/:friendshipId', async (c) => {
  const userId = c.get('userId')
  const friendshipId = c.req.param('friendshipId')
  const db = getDb(c.env)

  const [f] = await db
    .select({ id: friendships.id })
    .from(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        or(eq(friendships.userA, userId), eq(friendships.userB, userId)),
        eq(friendships.status, 'pending'),
      ),
    )
    .limit(1)

  if (!f) return c.json({ error: 'Friendship request not found' }, 404)

  await db.update(friendships).set({ status: 'accepted' }).where(eq(friendships.id, friendshipId))

  return c.json({ success: true })
})

// ─── POST /friends/decline/:friendshipId ─────────────────────────────────────

router.post('/decline/:friendshipId', async (c) => {
  const userId = c.get('userId')
  const friendshipId = c.req.param('friendshipId')
  const db = getDb(c.env)

  const [f] = await db
    .select({ id: friendships.id })
    .from(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        eq(friendships.userB, userId),
        eq(friendships.status, 'pending'),
      ),
    )
    .limit(1)

  if (!f) return c.json({ error: 'Request not found' }, 404)

  await db.delete(friendships).where(eq(friendships.id, friendshipId))

  return c.json({ success: true })
})

// ─── GET /friends/pending ─────────────────────────────────────────────────────

router.get('/pending', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const pending = await db
    .select({
      friendshipId: friendships.id,
      sentAt: friendships.createdAt,
      senderId: friendships.userA,
    })
    .from(friendships)
    .where(and(eq(friendships.userB, userId), eq(friendships.status, 'pending')))
    .orderBy(desc(friendships.createdAt))

  if (pending.length === 0) return c.json({ requests: [] })

  const requests = await Promise.all(
    pending.map(async ({ friendshipId, sentAt, senderId }) => {
      const [[user], [solvedRow]] = await Promise.all([
        db
          .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
          .from(users)
          .where(eq(users.id, senderId))
          .limit(1),
        db
          .select({ count: count() })
          .from(userProgress)
          .where(and(eq(userProgress.userId, senderId), eq(userProgress.status, 'solved'))),
      ])

      return {
        friendshipId,
        sentAt: sentAt ?? 0,
        from: { ...(user ?? { id: senderId, name: 'Unknown', username: 'unknown', avatarUrl: null }), problemsSolved: solvedRow?.count ?? 0 },
      }
    }),
  )

  return c.json({ requests })
})

// ─── GET /friends/search?q= ───────────────────────────────────────────────────

router.get('/search', async (c) => {
  const q = c.req.query('q')?.trim()
  if (!q || q.length < 2) return c.json({ users: [] })

  const userId = c.get('userId')
  const db = getDb(c.env)

  const [results, userFriendships] = await Promise.all([
    db
      .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
      .from(users)
      .where(like(users.username, `%${q}%`))
      .limit(15),
    db
      .select({ userA: friendships.userA, userB: friendships.userB, status: friendships.status })
      .from(friendships)
      .where(or(eq(friendships.userA, userId), eq(friendships.userB, userId))),
  ])

  const friendshipMap = new Map<string, string>()
  for (const f of userFriendships) {
    const otherId = f.userA === userId ? f.userB : f.userA
    friendshipMap.set(otherId, f.status)
  }

  const filtered = results
    .filter((u) => u.id !== userId)
    .map((u) => {
      const status = friendshipMap.get(u.id)
      return {
        ...u,
        is_friend: status === 'accepted',
        pending_request: status === 'pending',
      }
    })

  return c.json({ users: filtered })
})

// ─── POST /friends/request/:targetId ─────────────────────────────────────────

router.post('/request/:targetId', async (c) => {
  const userId = c.get('userId')
  const targetId = c.req.param('targetId')
  const db = getDb(c.env)

  if (userId === targetId) return c.json({ error: 'Cannot add yourself' }, 400)

  const [existing] = await db
    .select({ id: friendships.id, status: friendships.status })
    .from(friendships)
    .where(
      or(
        and(eq(friendships.userA, userId), eq(friendships.userB, targetId)),
        and(eq(friendships.userA, targetId), eq(friendships.userB, userId)),
      ),
    )
    .limit(1)

  if (existing) {
    return c.json({ error: 'Request already exists', status: existing.status }, 400)
  }

  const [sender] = await db
    .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const friendshipId = crypto.randomUUID()
  const now = Date.now()

  await db.insert(friendships).values({
    id: friendshipId,
    userA: userId,
    userB: targetId,
    status: 'pending',
    createdAt: now,
  })

  // Notify target via activity log
  await db.insert(activityLog).values({
    id: crypto.randomUUID(),
    userId: targetId,
    type: 'friend_request',
    payload: JSON.stringify({
      from_user_id: userId,
      from_username: sender?.username,
      from_avatar: sender?.avatarUrl,
      friendship_id: friendshipId,
    }),
    createdAt: now,
  })

  // Push to target's live WebSocket connection if active
  await broadcastToUser(c.env, targetId, {
    type: 'friend_request',
    friendshipId,
    from: {
      id: sender?.id ?? userId,
      name: sender?.name ?? '',
      username: sender?.username ?? '',
      avatarUrl: sender?.avatarUrl ?? null,
    },
  })

  return c.json({ friendshipId, status: 'pending' })
})

// ─── GET /friends ─────────────────────────────────────────────────────────────

router.get('/', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)
  const now = Date.now()
  const weekAgo = now - 7 * DAY
  const ws = weekStart(now)

  const accepted = await db
    .select()
    .from(friendships)
    .where(
      and(
        or(eq(friendships.userA, userId), eq(friendships.userB, userId)),
        eq(friendships.status, 'accepted'),
      ),
    )

  const friendIds = accepted.map((f) => (f.userA === userId ? f.userB : f.userA))

  if (friendIds.length === 0) return c.json({ friends: [] })

  const result = await Promise.all(
    friendIds.map(async (friendId) => {
      const [[user], [xp], weeklyRow, streak] = await Promise.all([
        db
          .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
          .from(users)
          .where(eq(users.id, friendId))
          .limit(1),
        db
          .select({ totalXp: userXp.totalXp, weeklyXp: userXp.weeklyXp, weekStart: userXp.weekStart })
          .from(userXp)
          .where(eq(userXp.userId, friendId))
          .limit(1),
        db
          .select({ count: count() })
          .from(activityLog)
          .where(
            and(
              eq(activityLog.userId, friendId),
              eq(activityLog.type, 'solved'),
              gt(activityLog.createdAt, weekAgo),
            ),
          ),
        getStreak(db, friendId),
      ])

      return {
        ...user,
        totalXp: xp?.totalXp ?? 0,
        weeklyXp: xp?.weekStart === ws ? (xp?.weeklyXp ?? 0) : 0,
        problemsSolvedThisWeek: weeklyRow[0]?.count ?? 0,
        currentStreak: streak,
      }
    }),
  )

  return c.json({ friends: result })
})

// ─── GET /friends/:userId/progress ───────────────────────────────────────────

router.get('/:userId/progress', async (c) => {
  const currentUserId = c.get('userId')
  const targetUserId = c.req.param('userId')
  const db = getDb(c.env)

  const [f] = await db
    .select({ id: friendships.id })
    .from(friendships)
    .where(
      and(
        or(
          and(eq(friendships.userA, currentUserId), eq(friendships.userB, targetUserId)),
          and(eq(friendships.userA, targetUserId), eq(friendships.userB, currentUserId)),
        ),
        eq(friendships.status, 'accepted'),
      ),
    )
    .limit(1)

  if (!f) return c.json({ error: 'Not authorized to view this profile' }, 403)

  const topicProgress = await db
    .select({
      topic: problems.topic,
      total: count(problems.id),
      solved: count(userProgress.id),
      avgConfidence: userProgress.confidence,
    })
    .from(problems)
    .leftJoin(
      userProgress,
      and(
        eq(userProgress.problemId, problems.id),
        eq(userProgress.userId, targetUserId),
        eq(userProgress.status, 'solved'),
      ),
    )
    .groupBy(problems.topic)
    .orderBy(problems.topic)

  return c.json({ topicProgress })
})

export default router
