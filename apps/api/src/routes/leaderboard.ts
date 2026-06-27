import { Hono } from 'hono'
import { and, avg, count, eq, or } from 'drizzle-orm'
import { getDb } from '../db'
import type { DB } from '../db'
import { activityLog, friendships, problems, userProgress, userXp, users } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

const router = new Hono<AppEnv>()

router.use('*', authMiddleware)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY = 86_400_000

function weekStart(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d.getTime()
}

function monthStart(ts: number): number {
  const d = new Date(ts)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

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
    if (sorted[i] === sorted[i - 1] - 1) streak++
    else break
  }
  return streak
}

async function getFriendIds(db: ReturnType<typeof getDb>, userId: string): Promise<string[]> {
  const rows = await db
    .select({ userA: friendships.userA, userB: friendships.userB })
    .from(friendships)
    .where(
      and(
        or(eq(friendships.userA, userId), eq(friendships.userB, userId)),
        eq(friendships.status, 'accepted'),
      ),
    )
  return rows.map((r) => (r.userA === userId ? r.userB : r.userA))
}

// ─── GET /leaderboard/friends ─────────────────────────────────────────────────

router.get('/friends', async (c) => {
  const userId = c.get('userId')
  const period = (c.req.query('period') ?? 'weekly') as 'weekly' | 'monthly' | 'alltime'
  const db = getDb(c.env)
  const now = Date.now()

  const cacheKey = `leaderboard:friends:${userId}:${period}`
  const cached = await c.env.KV.get(cacheKey, 'json')
  if (cached) return c.json(cached)

  const friendIds = await getFriendIds(db, userId)
  const allIds = [userId, ...friendIds]

  const ws = weekStart(now)
  const ms = monthStart(now)

  const xpRows = await Promise.all(
    allIds.map(async (uid) => {
      const [[xp], [user], [solvedRow], streak] = await Promise.all([
        db.select().from(userXp).where(eq(userXp.userId, uid)).limit(1),
        db
          .select({ id: users.id, username: users.username, name: users.name, avatarUrl: users.avatarUrl })
          .from(users)
          .where(eq(users.id, uid))
          .limit(1),
        db
          .select({ count: count() })
          .from(userProgress)
          .where(and(eq(userProgress.userId, uid), eq(userProgress.status, 'solved'))),
        getStreak(db, uid),
      ])

      const rawWeekly = xp?.weekStart === ws ? (xp?.weeklyXp ?? 0) : 0
      const rawMonthly = xp?.monthStart === ms ? (xp?.monthlyXp ?? 0) : 0
      const xpValue =
        period === 'weekly' ? rawWeekly : period === 'monthly' ? rawMonthly : (xp?.totalXp ?? 0)

      return {
        ...user,
        xp: xpValue,
        solved: solvedRow?.count ?? 0,
        streak,
        isCurrentUser: uid === userId,
      }
    }),
  )

  const ranked = xpRows.sort((a, b) => b.xp - a.xp).map((r, i) => ({ rank: i + 1, ...r }))
  const result = { period, leaderboard: ranked }
  await c.env.KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 })

  return c.json(result)
})

// ─── GET /leaderboard/topics ──────────────────────────────────────────────────

router.get('/topics', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const friendIds = await getFriendIds(db, userId)
  const allIds = [userId, ...friendIds]

  const rows = await Promise.all(
    allIds.map(async (uid) => {
      const [user] = await db
        .select({ id: users.id, username: users.username, name: users.name, avatarUrl: users.avatarUrl })
        .from(users)
        .where(eq(users.id, uid))
        .limit(1)

      const topicStats = await db
        .select({
          topic: problems.topic,
          avgConfidence: avg(userProgress.confidence),
          solved: count(userProgress.id),
        })
        .from(userProgress)
        .innerJoin(problems, eq(userProgress.problemId, problems.id))
        .where(and(eq(userProgress.userId, uid), eq(userProgress.status, 'solved')))
        .groupBy(problems.topic)

      return { user: { ...user, isCurrentUser: uid === userId }, topicStats }
    }),
  )

  const topicMap: Record<
    string,
    { user: (typeof rows)[0]['user']; avgConfidence: number; solved: number }[]
  > = {}

  for (const { user, topicStats } of rows) {
    for (const t of topicStats) {
      if (!topicMap[t.topic]) topicMap[t.topic] = []
      topicMap[t.topic].push({
        user,
        avgConfidence: Number(t.avgConfidence ?? 0),
        solved: t.solved,
      })
    }
  }

  for (const topic of Object.keys(topicMap)) {
    topicMap[topic].sort((a, b) => b.avgConfidence - a.avgConfidence)
  }

  return c.json({ topics: topicMap })
})

export default router
