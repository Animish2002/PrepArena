// Routes that need to accept both session JWTs and personal API tokens.
// Mounted at /api in index.ts (before the standard progress router)
// so /api/progress/complete is matched here first.

import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { problems, userProgress } from '../db/schema'
import { flexAuthMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

const router = new Hono<AppEnv>()
router.use('*', flexAuthMiddleware)

// ─── POST /api/progress/complete ──────────────────────────────────────────────
// Marks a single problem solved by LeetCode slug. Called by the browser
// extension in real-time after a submission is accepted on leetcode.com.

router.post('/progress/complete', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ leetcodeSlug?: string }>()

  if (!body.leetcodeSlug || typeof body.leetcodeSlug !== 'string') {
    return c.json({ error: 'leetcodeSlug is required' }, 400)
  }

  const db = getDb(c.env)
  const [problem] = await db
    .select({ id: problems.id, title: problems.title })
    .from(problems)
    .where(eq(problems.leetcodeSlug, body.leetcodeSlug))
    .limit(1)

  if (!problem) return c.json({ error: 'No PrepArena problem mapped to this slug' }, 404)

  const now = Date.now()
  await db
    .insert(userProgress)
    .values({
      id: crypto.randomUUID(),
      userId,
      problemId: problem.id,
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

  return c.json({ success: true, problemId: problem.id, title: problem.title })
})

export default router
