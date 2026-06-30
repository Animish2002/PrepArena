import { drizzle } from 'drizzle-orm/d1'
import { problems } from '../db/schema'
import { OOPS_THEORY_QUESTIONS, OOPS_MCQ_QUESTIONS, type QuestionEntry } from './generateContentBank'

// ─── Builder ──────────────────────────────────────────────────────────────────

function buildRows(
  entries: QuestionEntry[],
  prefix: string,
): (typeof problems.$inferInsert)[] {
  return entries.map((q, i) => ({
    id: `${prefix}-${String(i + 1).padStart(3, '0')}`,
    title: q.title,
    topic: q.topic,
    subtopic: q.subtopic ?? null,
    difficulty: q.difficulty,
    platform: null,
    platformLink: null,
    estimatedMinutes: q.estimated_minutes,
    sheet: q.sheet,
    problemNumber: i + 1,
    tags: JSON.stringify(q.tags),
    questionType: q.question_type,
    subject: q.subject,
    content: q.content,
    contentSource: q.content_source,
  }))
}

// ─── Exported Data ────────────────────────────────────────────────────────────

export const allOopsProblems: (typeof problems.$inferInsert)[] = [
  ...buildRows(OOPS_THEORY_QUESTIONS, 'oops-theory'),
  ...buildRows(OOPS_MCQ_QUESTIONS, 'oops-mcq'),
]

// ─── Seeder ───────────────────────────────────────────────────────────────────

export async function seedOops(d1: D1Database): Promise<number> {
  const db = drizzle(d1)
  const BATCH = 20
  let inserted = 0

  for (let i = 0; i < allOopsProblems.length; i += BATCH) {
    const r = await db
      .insert(problems)
      .values(allOopsProblems.slice(i, i + BATCH))
      .onConflictDoNothing()
    inserted += r.meta?.changes ?? 0
  }

  console.log(
    `OOPs: inserted ${inserted}/${allOopsProblems.length}` +
      (allOopsProblems.length - inserted > 0
        ? ` (${allOopsProblems.length - inserted} already existed)`
        : ''),
  )
  return inserted
}
