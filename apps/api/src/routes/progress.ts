import { Hono } from 'hono'
import { and, avg, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { getDb } from '../db'
import type { DB } from '../db'
import {
  activityLog,
  mcqAttempts,
  problems,
  revisionSchedule,
  solveSessions,
  userProgress,
  userXp,
} from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'
import { maybeUpdateChallengeProgress } from './challenges'

const router = new Hono<AppEnv>()

router.use('*', authMiddleware)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY = 86_400_000
const XP_MAP: Record<string, number> = { easy: 10, medium: 25, hard: 50 }
const MCQ_XP_MAP: Record<string, number> = { easy: 5, medium: 10, hard: 15 }
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

async function awardXp(db: DB, userId: string, xpGained: number): Promise<void> {
  const ws = weekStart(Date.now())
  const ms = monthStart(Date.now())

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
}

// ─── POST /progress/:problemId/solve ─────────────────────────────────────────

router.post('/:problemId/solve', async (c) => {
  const userId = c.get('userId')
  const problemId = c.req.param('problemId')
  const body = await c.req.json<{
    confidence: 1 | 2 | 3 | 4
    duration_seconds?: number
    started_at?: number
  }>()
  const db = getDb(c.env)
  const now = Date.now()

  const [problem] = await db.select().from(problems).where(eq(problems.id, problemId)).limit(1)
  if (!problem) return c.json({ error: 'Problem not found' }, 404)

  // MCQs have their own route with streak-based confidence
  if (problem.questionType === 'mcq') {
    return c.json({ error: 'Use POST /progress/:problemId/mcq-attempt for MCQ problems' }, 400)
  }

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

  // Theory questions have no timer — skip solve session recording
  if (problem.questionType !== 'theory' && body.duration_seconds != null && body.started_at != null) {
    await db.insert(solveSessions).values({
      id: crypto.randomUUID(),
      userId,
      problemId,
      startedAt: body.started_at,
      endedAt: now,
      durationSeconds: body.duration_seconds,
    })
  }

  await scheduleRevisions(db, userId, problemId, now)

  const xpGained = XP_MAP[problem.difficulty ?? 'easy'] ?? 10
  await awardXp(db, userId, xpGained)

  await db.insert(activityLog).values({
    id: crypto.randomUUID(),
    userId,
    type: 'solved',
    payload: JSON.stringify({
      problem_title: problem.title,
      topic: problem.topic,
      difficulty: problem.difficulty,
      question_type: problem.questionType,
      duration_seconds: body.duration_seconds ?? null,
    }),
    createdAt: now,
  })

  const [xpRow] = await db
    .select({ totalXp: userXp.totalXp })
    .from(userXp)
    .where(eq(userXp.userId, userId))
    .limit(1)

  const challengeUpdate = await maybeUpdateChallengeProgress(
    db,
    c.env,
    userId,
    problemId,
    body.duration_seconds ?? 0,
  ).catch(() => null)

  return c.json({
    success: true,
    xp_gained: xpGained,
    total_xp: xpRow?.totalXp ?? xpGained,
    challenge: challengeUpdate,
  })
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

// ─── POST /progress/:problemId/mcq-attempt ───────────────────────────────────

router.post('/:problemId/mcq-attempt', async (c) => {
  const userId = c.get('userId')
  const problemId = c.req.param('problemId')
  const { selected_index } = await c.req.json<{ selected_index: number }>()
  const db = getDb(c.env)
  const now = Date.now()

  const [problem] = await db.select().from(problems).where(eq(problems.id, problemId)).limit(1)
  if (!problem) return c.json({ error: 'Problem not found' }, 404)
  if (problem.questionType !== 'mcq') return c.json({ error: 'Not an MCQ problem' }, 400)

  let correctIndex: number
  let explanation: string
  try {
    const parsed = JSON.parse(problem.content ?? '{}') as {
      correct_index: number
      explanation?: string
    }
    correctIndex = parsed.correct_index
    explanation = parsed.explanation ?? ''
  } catch {
    return c.json({ error: 'Invalid MCQ content' }, 500)
  }

  const isCorrect = selected_index === correctIndex

  // Always record the attempt first so the streak query below sees it
  await db.insert(mcqAttempts).values({
    id: crypto.randomUUID(),
    userId,
    problemId,
    selectedIndex: selected_index,
    isCorrect: isCorrect ? 1 : 0,
    attemptedAt: now,
  })

  if (isCorrect) {
    // Count consecutive correct attempts (descending) to determine confidence tier
    const recent = await db
      .select({ isCorrect: mcqAttempts.isCorrect })
      .from(mcqAttempts)
      .where(and(eq(mcqAttempts.userId, userId), eq(mcqAttempts.problemId, problemId)))
      .orderBy(desc(mcqAttempts.attemptedAt))
      .limit(10)

    let streak = 0
    for (const a of recent) {
      if (a.isCorrect === 1) streak++
      else break
    }

    // 1 correct = 2, 3 in a row = 3, 5+ in a row = 4
    const confidence: 2 | 3 | 4 = streak >= 5 ? 4 : streak >= 3 ? 3 : 2

    await db
      .insert(userProgress)
      .values({
        id: crypto.randomUUID(),
        userId,
        problemId,
        status: 'solved',
        confidence,
        attempts: 1,
        firstSolvedAt: now,
        lastSolvedAt: now,
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.problemId],
        set: {
          status: 'solved',
          confidence,
          attempts: sql`${userProgress.attempts} + 1`,
          lastSolvedAt: now,
        },
      })

    await scheduleRevisions(db, userId, problemId, now)

    const xpGained = MCQ_XP_MAP[problem.difficulty ?? 'easy'] ?? 5
    await awardXp(db, userId, xpGained)

    await db.insert(activityLog).values({
      id: crypto.randomUUID(),
      userId,
      type: 'solved',
      payload: JSON.stringify({
        problem_title: problem.title,
        topic: problem.topic,
        difficulty: problem.difficulty,
        question_type: 'mcq',
      }),
      createdAt: now,
    })

    return c.json({ is_correct: true, correct_index: correctIndex, explanation, xp_gained: xpGained })
  }

  // Wrong answer — mark attempted, but never downgrade a previously solved row
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
        attempts: sql`${userProgress.attempts} + 1`,
        status: sql`CASE WHEN ${userProgress.status} = 'solved' THEN 'solved' ELSE 'attempted' END`,
      },
    })

  return c.json({ is_correct: false, correct_index: correctIndex, explanation, xp_gained: null })
})

// ─── GET /progress/stats ──────────────────────────────────────────────────────

router.get('/stats', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const [
    solvedByDiff,
    totalByDiff,
    avgTimeByDiff,
    topicBreakdown,
    confidenceDist,
    xpRow,
    subjectSolvedByType,
    subjectTotalsByType,
    mcqStatsBySubject,
    dsaConfRow,
  ] = await Promise.all([
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

    // Avg solve time per difficulty (coding/sql only — theory has no sessions)
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

    // Subject + questionType → solved count
    db
      .select({
        subject: problems.subject,
        questionType: problems.questionType,
        solved: count(),
      })
      .from(userProgress)
      .innerJoin(problems, eq(userProgress.problemId, problems.id))
      .where(and(eq(userProgress.userId, userId), eq(userProgress.status, 'solved')))
      .groupBy(problems.subject, problems.questionType),

    // Subject + questionType → total count
    db
      .select({
        subject: problems.subject,
        questionType: problems.questionType,
        total: count(),
      })
      .from(problems)
      .groupBy(problems.subject, problems.questionType),

    // MCQ attempt stats per subject: total attempts + correct count
    db
      .select({
        subject: problems.subject,
        totalAttempts: count(),
        correctAttempts: sql<number>`SUM(CASE WHEN ${mcqAttempts.isCorrect} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(mcqAttempts)
      .innerJoin(problems, eq(mcqAttempts.problemId, problems.id))
      .where(eq(mcqAttempts.userId, userId))
      .groupBy(problems.subject),

    // DSA avg confidence for readiness score
    db
      .select({ avgConf: avg(userProgress.confidence) })
      .from(userProgress)
      .innerJoin(problems, eq(userProgress.problemId, problems.id))
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.status, 'solved'),
          eq(problems.subject, 'dsa'),
        ),
      ),
  ])

  // ── Assemble subject breakdown ──────────────────────────────────────────────

  // Build lookup maps from the query results
  const solvedMap = new Map<string, number>()
  for (const r of subjectSolvedByType) {
    solvedMap.set(`${r.subject}:${r.questionType}`, r.solved)
  }
  const totalMap = new Map<string, number>()
  for (const r of subjectTotalsByType) {
    totalMap.set(`${r.subject}:${r.questionType}`, r.total)
  }
  const mcqMap = new Map<string, { total: number; correct: number }>()
  for (const r of mcqStatsBySubject) {
    mcqMap.set(r.subject ?? '', {
      total: r.totalAttempts,
      correct: Number(r.correctAttempts ?? 0),
    })
  }

  function get(subject: string, qtype: string, map: Map<string, number>): number {
    return map.get(`${subject}:${qtype}`) ?? 0
  }

  function mcqCorrectRate(subject: string): number {
    const m = mcqMap.get(subject)
    if (!m || m.total === 0) return 0
    return Math.round((m.correct / m.total) * 100) / 100
  }

  function subjectStats(subj: string) {
    const theoryTotal = get(subj, 'theory', totalMap)
    const mcqTotal = get(subj, 'mcq', totalMap)
    return {
      theory_solved: get(subj, 'theory', solvedMap),
      theory_total: theoryTotal,
      mcq_correct_rate: mcqCorrectRate(subj),
      mcq_total: mcqTotal,
      total: theoryTotal + mcqTotal,
    }
  }

  const dsaSolved = get('dsa', 'coding', solvedMap)
  const dsaTotal = get('dsa', 'coding', totalMap)
  const dsaAvgConf = Number(dsaConfRow[0]?.avgConf ?? 1)

  const sqlCodingSolved = get('sql', 'sql', solvedMap)
  const sqlCodingTotal = get('sql', 'sql', totalMap)
  const sqlTheorySolved = get('sql', 'theory', solvedMap)
  const sqlTheoryTotal = get('sql', 'theory', totalMap)

  const subjects = {
    dsa: {
      solved: dsaSolved,
      total: dsaTotal,
      avg_confidence: Math.round(dsaAvgConf * 100) / 100,
    },
    sql: {
      coding_solved: sqlCodingSolved,
      coding_total: sqlCodingTotal,
      theory_solved: sqlTheorySolved,
      theory_total: sqlTheoryTotal,
      total: sqlCodingTotal + sqlTheoryTotal,
    },
    java: subjectStats('java'),
    oops: subjectStats('oops'),
    spring: subjectStats('spring-boot'),
  }

  // ── Overall readiness (0-100) ───────────────────────────────────────────────

  function pct(num: number, den: number): number {
    return den > 0 ? Math.round((num / den) * 100) : 0
  }

  // DSA: weighted blend of completion % and avg confidence normalized to 0-100
  const dsaConf100 = Math.round(((dsaAvgConf - 1) / 3) * 100)
  const dsaReadiness = Math.round(pct(dsaSolved, dsaTotal) * 0.6 + dsaConf100 * 0.4)

  const sqlReadiness = Math.round(
    pct(sqlCodingSolved, sqlCodingTotal) * 0.65 +
    pct(sqlTheorySolved, sqlTheoryTotal) * 0.35,
  )

  function subjectReadiness(subj: string): number {
    const s = subjectStats(subj)
    const theoryCompletion = pct(s.theory_solved, s.theory_total)
    const mcqPct = Math.round(s.mcq_correct_rate * 100)
    return Math.round(theoryCompletion * 0.5 + mcqPct * 0.5)
  }

  const overall_readiness = Math.round(
    dsaReadiness * 0.40 +
    sqlReadiness * 0.25 +
    subjectReadiness('java') * 0.15 +
    subjectReadiness('oops') * 0.12 +
    subjectReadiness('spring-boot') * 0.08,
  )

  // ── Legacy DSA readiness (topic-weighted confidence) ───────────────────────

  let weightedConf = 0
  let totalSolved = 0
  for (const t of topicBreakdown) {
    const s = t.solved
    const conf = Number(t.avgConfidence ?? 1)
    weightedConf += conf * s
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
    subjects,
    overall_readiness,
    xp: {
      total: xp?.totalXp ?? 0,
      weekly: xp?.weekStart === ws ? (xp?.weeklyXp ?? 0) : 0,
      monthly: xp?.monthStart === ms ? (xp?.monthlyXp ?? 0) : 0,
    },
  })
})

// ─── GET /progress/:problemId/mcq-result ─────────────────────────────────────

router.get('/:problemId/mcq-result', async (c) => {
  const userId = c.get('userId')
  const problemId = c.req.param('problemId')
  const db = getDb(c.env)

  const [problem] = await db.select().from(problems).where(eq(problems.id, problemId)).limit(1)
  if (!problem) return c.json({ error: 'Problem not found' }, 404)
  if (problem.questionType !== 'mcq') return c.json({ error: 'Not an MCQ problem' }, 400)

  const [lastAttempt] = await db
    .select()
    .from(mcqAttempts)
    .where(and(eq(mcqAttempts.userId, userId), eq(mcqAttempts.problemId, problemId)))
    .orderBy(desc(mcqAttempts.attemptedAt))
    .limit(1)

  if (!lastAttempt) {
    return c.json({ error: 'No attempt found — submit an answer first' }, 404)
  }

  let correctIndex: number
  let explanation: string
  try {
    const parsed = JSON.parse(problem.content ?? '{}') as {
      correct_index: number
      explanation?: string
    }
    correctIndex = parsed.correct_index
    explanation = parsed.explanation ?? ''
  } catch {
    return c.json({ error: 'Invalid MCQ content' }, 500)
  }

  return c.json({
    correct_index: correctIndex,
    explanation,
    user_attempt: {
      selected_index: lastAttempt.selectedIndex,
      is_correct: lastAttempt.isCorrect === 1,
      attempted_at: lastAttempt.attemptedAt,
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
      questionType: problems.questionType,
      subject: problems.subject,
      confidence: userProgress.confidence,
      lastSolvedAt: userProgress.lastSolvedAt,
    })
    .from(revisionSchedule)
    .innerJoin(problems, eq(revisionSchedule.problemId, problems.id))
    .leftJoin(
      userProgress,
      and(
        eq(userProgress.problemId, revisionSchedule.problemId),
        eq(userProgress.userId, userId),
      ),
    )
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

// ─── GET /progress/revisions/upcoming ────────────────────────────────────────

router.get('/revisions/upcoming', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const now = Date.now()
  const todayMidnight = (() => {
    const d = new Date(now)
    d.setUTCHours(0, 0, 0, 0)
    return d.getTime()
  })()
  const eightDaysLater = todayMidnight + 8 * DAY

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
      questionType: problems.questionType,
      subject: problems.subject,
    })
    .from(revisionSchedule)
    .innerJoin(problems, eq(revisionSchedule.problemId, problems.id))
    .where(
      and(
        eq(revisionSchedule.userId, userId),
        gte(revisionSchedule.dueDate, todayMidnight),
        lte(revisionSchedule.dueDate, eightDaysLater),
        eq(revisionSchedule.completed, 0),
      ),
    )
    .orderBy(revisionSchedule.dueDate)

  type RevisionRow = (typeof rows)[number]
  const upcoming: Record<string, RevisionRow[]> = {}
  for (const row of rows) {
    const d = new Date(row.dueDate ?? 0)
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
    if (!upcoming[dateStr]) upcoming[dateStr] = []
    upcoming[dateStr].push(row)
  }

  return c.json({ upcoming })
})

// ─── GET /progress/activity-streak ───────────────────────────────────────────

router.get('/activity-streak', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const rows = await db
    .select({ createdAt: activityLog.createdAt })
    .from(activityLog)
    .where(and(eq(activityLog.userId, userId), eq(activityLog.type, 'solved')))

  const daySet = new Set(
    rows.map((r) => {
      const d = new Date(r.createdAt ?? 0)
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
    }),
  )

  const activeDates = [...daySet].sort()

  return c.json({ activeDates })
})

// ─── GET /progress/daily-mission ─────────────────────────────────────────────

router.get('/daily-mission', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const now = Date.now()
  const todayStart = (() => {
    const d = new Date(now)
    d.setUTCHours(0, 0, 0, 0)
    return d.getTime()
  })()

  const [easyRow, mediumRow, revisionRow] = await Promise.all([
    db
      .select({ cnt: sql<number>`COUNT(*)` })
      .from(solveSessions)
      .innerJoin(problems, eq(solveSessions.problemId, problems.id))
      .where(
        and(
          eq(solveSessions.userId, userId),
          eq(problems.difficulty, 'easy'),
          gte(solveSessions.startedAt, todayStart),
        ),
      ),
    db
      .select({ cnt: sql<number>`COUNT(*)` })
      .from(solveSessions)
      .innerJoin(problems, eq(solveSessions.problemId, problems.id))
      .where(
        and(
          eq(solveSessions.userId, userId),
          eq(problems.difficulty, 'medium'),
          gte(solveSessions.startedAt, todayStart),
        ),
      ),
    db
      .select({ cnt: sql<number>`COUNT(*)` })
      .from(activityLog)
      .where(
        and(
          eq(activityLog.userId, userId),
          eq(activityLog.type, 'revision'),
          gte(activityLog.createdAt, todayStart),
        ),
      ),
  ])

  const easy = (easyRow[0]?.cnt ?? 0) >= 1
  const medium = (mediumRow[0]?.cnt ?? 0) >= 1
  const revision = (revisionRow[0]?.cnt ?? 0) >= 1
  const allDone = easy && medium && revision

  return c.json({ easy, medium, revision, allDone, xpReward: 150 })
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
