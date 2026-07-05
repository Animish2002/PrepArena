import { Hono } from 'hono'
import { and, count, desc, eq, sql } from 'drizzle-orm'
import { getDb } from '../db'
import { activityLog, solveSessions, userRatings, users } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

const router = new Hono<AppEnv>()

// ─── GET /profile/public/:username ────────────────────────────────────────────
// Public — no auth required. Used by the landing page to show the creator card.

router.get('/public/:username', async (c) => {
  const username = c.req.param('username')
  const db = getDb(c.env)
  const [user] = await db
    .select({ name: users.name, username: users.username, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)
  if (!user) return c.json({ error: 'Not found' }, 404)
  return c.json(user)
})

// ─── POST /profile/avatar ─────────────────────────────────────────────────────

router.post('/avatar', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const formData = await c.req.formData()
  const file = formData.get('file')

  if (!file || typeof (file as { arrayBuffer?: unknown }).arrayBuffer !== 'function') {
    return c.json({ error: 'No file provided' }, 400)
  }
  const blob = file as unknown as Blob

  const key = `avatars/${userId}`
  const arrayBuffer = await blob.arrayBuffer()
  const contentType = (file as { type?: string }).type || 'application/octet-stream'

  await c.env.R2.put(key, arrayBuffer, {
    httpMetadata: { contentType },
  })

  const db = getDb(c.env)
  const avatarUrl = `${c.env.WORKER_URL}/api/profile/avatar-file/${userId}`

  await db.update(users).set({ avatarUrl }).where(eq(users.id, userId))

  return c.json({ avatar_url: avatarUrl })
})

// ─── GET /profile/avatar-file/:userId ────────────────────────────────────────

router.get('/avatar-file/:userId', async (c) => {
  const userId = c.req.param('userId')
  const key = `avatars/${userId}`

  const object = await c.env.R2.get(key)

  if (!object) {
    return c.json({ error: 'Not found' }, 404)
  }

  const contentType = object.httpMetadata?.contentType ?? 'application/octet-stream'

  return new Response(object.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  })
})

// ─── PATCH /profile/ ─────────────────────────────────────────────────────────

router.patch('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ name?: string; username?: string }>()
  const db = getDb(c.env)

  const updates: Partial<{ name: string; username: string }> = {}

  if (body.name !== undefined) {
    updates.name = body.name
  }

  if (body.username !== undefined) {
    const username = body.username.toLowerCase().trim()

    if (username.length < 3) {
      return c.json({ error: 'Username must be at least 3 characters' }, 400)
    }

    if (!/^[a-z0-9_-]+$/.test(username)) {
      return c.json({ error: 'Username must be lowercase alphanumeric (underscores and hyphens allowed)' }, 400)
    }

    // Unique check
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, username), sql`${users.id} != ${userId}`))
      .limit(1)

    if (existing) {
      return c.json({ error: 'Username already taken' }, 409)
    }

    updates.username = username
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No fields to update' }, 400)
  }

  await db.update(users).set(updates).where(eq(users.id, userId))

  const [updated] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  return c.json({ user: updated })
})

// ─── GET /profile/stats ───────────────────────────────────────────────────────

const DAY = 86_400_000

router.get('/stats', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const [totalTimeRow] = await db
    .select({ totalTimeSeconds: sql<number>`COALESCE(SUM(${solveSessions.durationSeconds}), 0)` })
    .from(solveSessions)
    .where(eq(solveSessions.userId, userId))

  const [ratingsRow] = await db
    .select({
      rating: userRatings.rating,
      battlesWon: userRatings.battlesWon,
      battlesLost: userRatings.battlesLost,
    })
    .from(userRatings)
    .where(eq(userRatings.userId, userId))
    .limit(1)

  // Fetch all solved activity log timestamps for streak computation
  const solvedRows = await db
    .select({ createdAt: activityLog.createdAt })
    .from(activityLog)
    .where(and(eq(activityLog.userId, userId), eq(activityLog.type, 'solved')))

  // Compute unique days (YYYY-MM-DD) from timestamps
  const daySet = new Set(
    solvedRows.map((r) => {
      const d = new Date(r.createdAt ?? 0)
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
    }),
  )

  // Sort days descending
  const sortedDays = [...daySet].sort((a, b) => (a > b ? -1 : 1))

  const now = Date.now()
  const todayStr = (() => {
    const d = new Date(now)
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
  })()

  // Helper: YYYY-MM-DD to day index (days since epoch)
  const toDayIndex = (s: string) => Math.floor(new Date(s + 'T00:00:00Z').getTime() / DAY)

  const todayIdx = toDayIndex(todayStr)

  // Current streak: consecutive days ending today or yesterday
  let currentStreak = 0
  if (sortedDays.length > 0) {
    const mostRecentIdx = toDayIndex(sortedDays[0])
    if (mostRecentIdx >= todayIdx - 1) {
      currentStreak = 1
      for (let i = 1; i < sortedDays.length; i++) {
        if (toDayIndex(sortedDays[i]) === toDayIndex(sortedDays[i - 1]) - 1) {
          currentStreak++
        } else {
          break
        }
      }
    }
  }

  // Longest streak: scan all sorted days
  let longestStreak = 0
  let runLength = 0
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      runLength = 1
    } else if (toDayIndex(sortedDays[i]) === toDayIndex(sortedDays[i - 1]) - 1) {
      runLength++
    } else {
      runLength = 1
    }
    if (runLength > longestStreak) longestStreak = runLength
  }

  return c.json({
    totalTimeSeconds: totalTimeRow?.totalTimeSeconds ?? 0,
    rating: ratingsRow?.rating ?? 1200,
    battlesWon: ratingsRow?.battlesWon ?? 0,
    battlesLost: ratingsRow?.battlesLost ?? 0,
    currentStreak,
    longestStreak,
  })
})

// ─── GET /profile/activity ────────────────────────────────────────────────────

router.get('/activity', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const entries = await db
    .select()
    .from(activityLog)
    .where(eq(activityLog.userId, userId))
    .orderBy(desc(activityLog.createdAt))
    .limit(30)

  return c.json({ entries })
})

export default router
