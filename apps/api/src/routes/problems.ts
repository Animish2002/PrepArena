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
  const subject = c.req.query('subject')       // 'dsa' | 'sql' | 'java' | 'oops' | 'spring-boot' | 'all'
  const questionType = c.req.query('question_type') // 'coding' | 'sql' | 'theory' | 'mcq' | 'all'
  const sheet = c.req.query('sheet')           // e.g. 'leetcode-sql-50'
  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(500, Math.max(1, Number(c.req.query('limit') ?? 50)))

  // Theory content (markdown) is large — only include it when explicitly filtering for theory.
  // MCQ content is always included (small JSON) so the modal works from the "All" view too.
  const includeTheoryContent = questionType === 'theory'

  const where = and(
    topic ? eq(problems.topic, topic) : undefined,
    difficulty ? eq(problems.difficulty, difficulty) : undefined,
    platform ? eq(problems.platform, platform) : undefined,
    search ? like(problems.title, `%${search}%`) : undefined,
    subject && subject !== 'all' ? eq(problems.subject, subject) : undefined,
    questionType && questionType !== 'all' ? eq(problems.questionType, questionType) : undefined,
    sheet ? eq(problems.sheet, sheet) : undefined,
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
        questionType: problems.questionType,
        subject: problems.subject,
        content: problems.content,
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
    problems: rows.map((r) => {
      const { content, isBookmarked, ...rest } = r
      const base = { ...rest, isBookmarked: !!isBookmarked }

      // MCQ: always parse and include { question, options } — strip correct_index/explanation
      if (r.questionType === 'mcq' && content) {
        try {
          const parsed = JSON.parse(content) as { question: string; options: string[] }
          return { ...base, content: { question: parsed.question, options: parsed.options } }
        } catch {
          return { ...base, content: null }
        }
      }

      // Theory: only include full markdown when explicitly filtering for theory (content is large)
      if (r.questionType === 'theory' && includeTheoryContent) {
        return { ...base, content }
      }

      // Coding/SQL and unfiltered theory: omit content
      return base
    }),
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

  // MCQ: return { question, options } only — correct_index exposed after attempt via /mcq-result
  let safeContent: unknown = problem.content
  if (problem.questionType === 'mcq' && problem.content) {
    try {
      const parsed = JSON.parse(problem.content) as {
        question: string
        options: string[]
      }
      safeContent = { question: parsed.question, options: parsed.options }
    } catch {
      safeContent = null
    }
  }

  return c.json({
    ...problem,
    content: safeContent,
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
