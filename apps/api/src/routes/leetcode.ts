import { Hono } from 'hono'
import { and, eq, inArray } from 'drizzle-orm'
import { getDb } from '../db'
import { problems, userProgress, users } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import { fetchSolvedSlugs, validateLeetCodeUsername } from '../lib/leetcode'
import type { AppEnv } from '../types/env'

const router = new Hono<AppEnv>()
router.use('*', authMiddleware)

// ─── GET /api/leetcode/status ─────────────────────────────────────────────────

router.get('/status', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)
  const [user] = await db
    .select({ leetcodeUsername: users.leetcodeUsername, leetcodeLastSyncedAt: users.leetcodeLastSyncedAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  return c.json({
    leetcodeUsername: user?.leetcodeUsername ?? null,
    leetcodeLastSyncedAt: user?.leetcodeLastSyncedAt ?? null,
  })
})

// ─── POST /api/leetcode/link ──────────────────────────────────────────────────

router.post('/link', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ username?: string }>()
  const username = typeof body.username === 'string' ? body.username.trim() : ''

  if (username.length < 2) return c.json({ error: 'Invalid username' }, 400)

  const valid = await validateLeetCodeUsername(username)
  if (!valid) return c.json({ error: 'LeetCode username not found or profile is private' }, 404)

  const db = getDb(c.env)
  await db.update(users).set({ leetcodeUsername: username }).where(eq(users.id, userId))

  return c.json({ leetcodeUsername: username })
})

// ─── POST /api/leetcode/sync ──────────────────────────────────────────────────

router.post('/sync', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const [user] = await db
    .select({ leetcodeUsername: users.leetcodeUsername })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user?.leetcodeUsername) {
    return c.json({ error: 'No LeetCode username linked. Call POST /api/leetcode/link first.' }, 400)
  }

  const result = await fetchSolvedSlugs(user.leetcodeUsername)
  if (!result.ok) {
    const statusMap = { rate_limited: 429, private: 403, not_found: 404, network: 502 } as const
    return c.json({ error: result.error }, statusMap[result.error])
  }

  if (result.slugs.length === 0) {
    await db.update(users).set({ leetcodeLastSyncedAt: Date.now() }).where(eq(users.id, userId))
    return c.json({ matched: 0, newlyCompleted: 0 })
  }

  // Find PrepArena problems matching the solved slugs
  const matchedProblems = await db
    .select({ id: problems.id })
    .from(problems)
    .where(inArray(problems.leetcodeSlug, result.slugs))

  if (matchedProblems.length === 0) {
    await db.update(users).set({ leetcodeLastSyncedAt: Date.now() }).where(eq(users.id, userId))
    return c.json({ matched: 0, newlyCompleted: 0 })
  }

  const problemIds = matchedProblems.map((p) => p.id)

  // Find which ones the user already has solved
  const existing = await db
    .select({ problemId: userProgress.problemId, status: userProgress.status })
    .from(userProgress)
    .where(and(eq(userProgress.userId, userId), inArray(userProgress.problemId, problemIds)))

  const alreadySolved = new Set(existing.filter((r) => r.status === 'solved').map((r) => r.problemId))

  const now = Date.now()
  let newlyCompleted = 0

  for (const { id: problemId } of matchedProblems) {
    if (!alreadySolved.has(problemId)) newlyCompleted++
    await db
      .insert(userProgress)
      .values({
        id: crypto.randomUUID(),
        userId,
        problemId,
        status: 'solved',
        confidence: 3,
        attempts: 1,
        firstSolvedAt: now,
        lastSolvedAt: now,
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.problemId],
        set: { status: 'solved', lastSolvedAt: now },
      })
  }

  await db.update(users).set({ leetcodeLastSyncedAt: now }).where(eq(users.id, userId))

  return c.json({ matched: matchedProblems.length, newlyCompleted })
})

export default router
