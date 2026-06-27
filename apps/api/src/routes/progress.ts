import { Hono } from 'hono'
import { and, avg, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { getDb } from '../db'
import type { DB } from '../db'
import {
  activityLog,
  problems,
  revisionSchedule,
  solveSessions,
  userProgress,
  userXp,
} from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

const router = new Hono<AppEnv>()

router.use('*', authMiddleware)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY = 86_400_000
const XP_MAP: Record<string, number> = { easy: 10, medium: 25, hard: 50 }
const REVISION_DAYS = [1, 3, 7, 15, 30]

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

async function scheduleRevisions(db: DB, userId: string, problemId: string, now: number) {
  for (const days of REVISION_DAYS) {
    const dueDate = now + days * DAY
    const [existing] = await db
      .select({ id: revisionSchedule.id })
      .from(revisionSchedule)
      .where(
        and(
          eq(revisionSchedule.userId, userId),
          eq(revisionSchedule.problemId, problemId),
          gte(revisionSchedule.dueDate, dueDate - DAY / 2),
          lte(revisionSchedule.dueDate, dueDate + DAY / 2),
          eq(revisionSchedule.completed, 0),
        ),
      )
      .limit(1)

    if (!existing) {
      await db.insert(revisionSchedule).values({
        id: crypto.randomUUID(),
        userId,
        problemId,
        dueDate,
        completed: 0,
      })
    }
  }
}

// ─── POST /progress/:problemId/solve ─────────────────────────────────────────

router.post('/:problemId/solve', async (c) => {
  const userId = c.get('userId')
  const problemId = c.req.param('problemId')
  const body = await c.req.json<{
    confidence: 1 | 2 | 3 | 4
    duration_seconds: number
    started_at: number
  }>()
  const db = getDb(c.env)
  const now = Date.now()

  const [problem] = await db.select().from(problems).where(eq(problems.id, problemId)).limit(1)
  if (!problem) return c.json({ error: 'Problem not found' }, 404)

  // Upsert user_progress — preserve firstSolvedAt on conflict
  await db
    .insert(userProgress)
    .values({
      id: crypto.randomUUID(),
      userId,
      problemId,
      status: 'solved',
      confidence: body.confidence,
      attempts: 1,
      firstSolvedAt: now,
      lastSolvedAt: now,
    })
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.problemId],
      set: {
        status: 'solved',
        confidence: body.confidence,
        attempts: sql`${userProgress.attempts} + 1`,
        lastSolvedAt: now,
      },
    })

  // Insert solve session
  await db.insert(solveSessions).values({
    id: crypto.randomUUID(),
    userId,
    problemId,
    startedAt: body.started_at,
    endedAt: now,
    durationSeconds: body.duration_seconds,
  })

  // Schedule spaced-repetition revisions
  await scheduleRevisions(db, userId, problemId, now)

  // Calculate XP for this solve
  const xpGained = XP_MAP[problem.difficulty ?? 'easy'] ?? 10
  const ws = weekStart(now)
  const ms = monthStart(now)

  // Upsert user_xp — auto-reset weekly/monthly if period has rolled over
  await db
    .insert(userXp)
    .values({
      userId,
      totalXp: xpGained,
      weeklyXp: xpGained,
      monthlyXp: xpGained,
      weekStart: ws,
      monthStart: ms,
    })
    .onConflictDoUpdate({
      target: userXp.userId,
      set: {
        totalXp: sql`${userXp.totalXp} + ${xpGained}`,
        weeklyXp: sql`CASE WHEN ${userXp.weekStart} = ${ws} THEN ${userXp.weeklyXp} + ${xpGained} ELSE ${xpGained} END`,
        monthlyXp: sql`CASE WHEN ${userXp.monthStart} = ${ms} THEN ${userXp.monthlyXp} + ${xpGained} ELSE ${xpGained} END`,
        weekStart: ws,
        monthStart: ms,
      },
    })

  // Insert activity log
  await db.insert(activityLog).values({
    id: crypto.randomUUID(),
    userId,
    type: 'solved',
    payload: JSON.stringify({
      problem_title: problem.title,
      topic: problem.topic,
      difficulty: problem.difficulty,
      duration_seconds: body.duration_seconds,
    }),
    createdAt: now,
  })

  const [xpRow] = await db.select({ totalXp: userXp.totalXp }).from(userXp).where(eq(userXp.userId, userId)).limit(1)

  return c.json({ success: true, xp_gained: xpGained, total_xp: xpRow?.totalXp ?? xpGained })
})

// ─── POST /progress/:problemId/attempt ───────────────────────────────────────

router.post('/:problemId/attempt', async (c) => {
  const userId = c.get('userId')
  const problemId = c.req.param('problemId')
  const db = getDb(c.env)

  const [existing] = await db
    .select({ id: userProgress.id, status: userProgress.status })
    .from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.problemId, problemId)))
    .limit(1)

  if (existing?.status === 'solved') {
    return c.json({ success: true, status: 'solved' })
  }

  await db
    .insert(userProgress)
    .values({
      id: crypto.randomUUID(),
      userId,
      problemId,
      status: 'attempted',
      attempts: 1,
      firstSolvedAt: null,
      lastSolvedAt: null,
    })
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.problemId],
      set: {
        status: 'attempted',
        attempts: sql`${userProgress.attempts} + 1`,
      },
    })

  return c.json({ success: true, status: 'attempted' })
})

// ─── GET /progress/stats ──────────────────────────────────────────────────────

router.get('/stats', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const [solvedByDiff, totalByDiff, avgTimeByDiff, topicBreakdown, confidenceDist, xpRow] =
    await Promise.all([
      // Solved count per difficulty
      db
        .select({ difficulty: problems.difficulty, solved: count() })
        .from(userProgress)
        .innerJoin(problems, eq(userProgress.problemId, problems.id))
        .where(and(eq(userProgress.userId, userId), eq(userProgress.status, 'solved')))
        .groupBy(problems.difficulty),

      // Total problems per difficulty
      db
        .select({ difficulty: problems.difficulty, total: count() })
        .from(problems)
        .groupBy(problems.difficulty),

      // Avg solve time per difficulty
      db
        .select({
          difficulty: problems.difficulty,
          avgSeconds: avg(solveSessions.durationSeconds),
        })
        .from(solveSessions)
        .innerJoin(problems, eq(solveSessions.problemId, problems.id))
        .where(eq(solveSessions.userId, userId))
        .groupBy(problems.difficulty),

      // Topic breakdown: solved vs total, avg confidence
      db
        .select({
          topic: problems.topic,
          total: count(problems.id),
          solved: count(userProgress.id),
          avgConfidence: avg(userProgress.confidence),
        })
        .from(problems)
        .leftJoin(
          userProgress,
          and(
            eq(userProgress.problemId, problems.id),
            eq(userProgress.userId, userId),
            eq(userProgress.status, 'solved'),
          ),
        )
        .groupBy(problems.topic),

      // Confidence distribution
      db
        .select({ confidence: userProgress.confidence, count: count() })
        .from(userProgress)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.status, 'solved')))
        .groupBy(userProgress.confidence),

      // XP totals
      db.select().from(userXp).where(eq(userXp.userId, userId)).limit(1),
    ])

  // Interview readiness: weighted avg confidence across solved problems, scaled 0-100
  let weightedConf = 0
  let totalSolved = 0
  for (const t of topicBreakdown) {
    const s = t.solved
    const c = Number(t.avgConfidence ?? 1)
    weightedConf += c * s
    totalSolved += s
  }
  const interviewReadiness =
    totalSolved > 0 ? Math.round(((weightedConf / totalSolved - 1) / 3) * 100) : 0

  const now = Date.now()
  const ws = weekStart(now)
  const ms = monthStart(now)
  const xp = xpRow[0]

  return c.json({
    solvedByDifficulty: solvedByDiff,
    totalByDifficulty: totalByDiff,
    avgTimeByDifficulty: avgTimeByDiff,
    topicBreakdown,
    confidenceDistribution: confidenceDist,
    interviewReadiness,
    xp: {
      total: xp?.totalXp ?? 0,
      weekly: xp?.weekStart === ws ? (xp?.weeklyXp ?? 0) : 0,
      monthly: xp?.monthStart === ms ? (xp?.monthlyXp ?? 0) : 0,
    },
  })
})

// ─── GET /progress/revisions/today ───────────────────────────────────────────

router.get('/revisions/today', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)
  const now = Date.now()

  const rows = await db
    .select({
      id: revisionSchedule.id,
      dueDate: revisionSchedule.dueDate,
      problemId: problems.id,
      title: problems.title,
      topic: problems.topic,
      difficulty: problems.difficulty,
      platform: problems.platform,
      platformLink: problems.platformLink,
    })
    .from(revisionSchedule)
    .innerJoin(problems, eq(revisionSchedule.problemId, problems.id))
    .where(
      and(
        eq(revisionSchedule.userId, userId),
        lte(revisionSchedule.dueDate, now),
        eq(revisionSchedule.completed, 0),
      ),
    )
    .orderBy(revisionSchedule.dueDate)

  return c.json({ revisions: rows, count: rows.length })
})

// ─── POST /progress/revisions/:id/complete ───────────────────────────────────

router.post('/revisions/:id/complete', async (c) => {
  const userId = c.get('userId')
  const revisionId = c.req.param('id')
  const db = getDb(c.env)

  const [revision] = await db
    .select({ id: revisionSchedule.id })
    .from(revisionSchedule)
    .where(and(eq(revisionSchedule.id, revisionId), eq(revisionSchedule.userId, userId)))
    .limit(1)

  if (!revision) return c.json({ error: 'Revision not found' }, 404)

  await db
    .update(revisionSchedule)
    .set({ completed: 1 })
    .where(eq(revisionSchedule.id, revisionId))

  await db.insert(activityLog).values({
    id: crypto.randomUUID(),
    userId,
    type: 'revision',
    payload: JSON.stringify({ revision_id: revisionId }),
    createdAt: Date.now(),
  })

  return c.json({ success: true })
})

export default router
