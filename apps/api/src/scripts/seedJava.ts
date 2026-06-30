import { drizzle } from 'drizzle-orm/d1'
import { problems } from '../db/schema'
import { JAVA_THEORY_QUESTIONS, JAVA_MCQ_QUESTIONS, type QuestionEntry } from './generateContentBank'

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

export const allJavaProblems: (typeof problems.$inferInsert)[] = [
  ...buildRows(JAVA_THEORY_QUESTIONS, 'java-theory'),
  ...buildRows(JAVA_MCQ_QUESTIONS, 'java-mcq'),
]

// ─── Seeder ───────────────────────────────────────────────────────────────────

export async function seedJava(d1: D1Database): Promise<number> {
  const db = drizzle(d1)
  const BATCH = 20
  let inserted = 0

  for (let i = 0; i < allJavaProblems.length; i += BATCH) {
    const r = await db
      .insert(problems)
      .values(allJavaProblems.slice(i, i + BATCH))
      .onConflictDoNothing()
    inserted += r.meta?.changes ?? 0
  }

  console.log(
    `Java: inserted ${inserted}/${allJavaProblems.length}` +
      (allJavaProblems.length - inserted > 0
        ? ` (${allJavaProblems.length - inserted} already existed)`
        : ''),
  )
  return inserted
}
