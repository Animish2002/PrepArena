import { Hono } from 'hono'
import { and, count, eq, like } from 'drizzle-orm'
import { getDb } from '../db'
import { bookmarks, problemNotes, problems, userProgress } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

const router = new Hono<AppEnv>()

// ─── GET /problems ─────────────────────────────────────────────────────────────

router.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const topic = c.req.query('topic')
  const difficulty = c.req.query('difficulty')
  const platform = c.req.query('platform')
  const search = c.req.query('search')
  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(500, Math.max(1, Number(c.req.query('limit') ?? 50)))

  const where = and(
    topic ? eq(problems.topic, topic) : undefined,
    difficulty ? eq(problems.difficulty, difficulty) : undefined,
    platform ? eq(problems.platform, platform) : undefined,
    search ? like(problems.title, `%${search}%`) : undefined,
  )

  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(problems).where(where),
    db
      .select({
        id: problems.id,
        title: problems.title,
        topic: problems.topic,
        subtopic: problems.subtopic,
        difficulty: problems.difficulty,
        platform: problems.platform,
        platformLink: problems.platformLink,
        estimatedMinutes: problems.estimatedMinutes,
        sheet: problems.sheet,
        problemNumber: problems.problemNumber,
        tags: problems.tags,
        userStatus: userProgress.status,
        userConfidence: userProgress.confidence,
        isBookmarked: bookmarks.problemId,
      })
      .from(problems)
      .leftJoin(
        userProgress,
        and(eq(userProgress.problemId, problems.id), eq(userProgress.userId, userId)),
      )
      .leftJoin(
        bookmarks,
        and(eq(bookmarks.problemId, problems.id), eq(bookmarks.userId, userId)),
      )
      .where(where)
      .orderBy(problems.problemNumber)
      .limit(limit)
      .offset((page - 1) * limit),
  ])

  return c.json({
    problems: rows.map((r) => ({ ...r, isBookmarked: !!r.isBookmarked })),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  })
})

// ─── GET /problems/:id ────────────────────────────────────────────────────────

router.get('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const problemId = c.req.param('id')
  const db = getDb(c.env)

  const [problem] = await db.select().from(problems).where(eq(problems.id, problemId)).limit(1)

  if (!problem) return c.json({ error: 'Problem not found' }, 404)

  const [[progress], [notes], [bookmark]] = await Promise.all([
    db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.problemId, problemId)))
      .limit(1),
    db
      .select()
      .from(problemNotes)
      .where(and(eq(problemNotes.userId, userId), eq(problemNotes.problemId, problemId)))
      .limit(1),
    db
      .select({ problemId: bookmarks.problemId })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.problemId, problemId)))
      .limit(1),
  ])

  return c.json({
    ...problem,
    progress: progress ?? null,
    notes: notes ?? null,
    isBookmarked: !!bookmark,
  })
})

// ─── PUT /problems/:id/notes ──────────────────────────────────────────────────

router.put('/:id/notes', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const problemId = c.req.param('id')
  const db = getDb(c.env)

  const { content } = await c.req.json<{ content: string }>()

  await db
    .insert(problemNotes)
    .values({ id: crypto.randomUUID(), userId, problemId, content, updatedAt: Date.now() })
    .onConflictDoUpdate({
      target: [problemNotes.userId, problemNotes.problemId],
      set: { content, updatedAt: Date.now() },
    })

  return c.json({ ok: true })
})

// ─── POST /problems/:id/bookmark ─────────────────────────────────────────────

router.post('/:id/bookmark', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const problemId = c.req.param('id')
  const db = getDb(c.env)

  await db.insert(bookmarks).values({ userId, problemId }).onConflictDoNothing()

  return c.json({ ok: true, bookmarked: true })
})

// ─── DELETE /problems/:id/bookmark ───────────────────────────────────────────

router.delete('/:id/bookmark', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const problemId = c.req.param('id')
  const db = getDb(c.env)

  await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.problemId, problemId)))

  return c.json({ ok: true, bookmarked: false })
})

export default router
