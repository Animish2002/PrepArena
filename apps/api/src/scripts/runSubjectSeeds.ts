/**
 * Generates SQL dump files for all subject content banks.
 *
 * Run:   npx tsx src/scripts/runSubjectSeeds.ts
 * Apply: npx wrangler d1 execute preParena-db --local  --file=src/scripts/sql/java.sql
 *        npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/java.sql
 *   (repeat for all sql files in src/scripts/sql/)
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { allJavaProblems } from './seedJava'
import { allOopsProblems } from './seedOops'
import { allSpringProblems } from './seedSpring'
import { allSqlTheoryProblems } from './seedSqlTheory'
import { allSqlCodingProblems } from './seedSqlCoding'
import { allJavaScriptProblems } from './seedJavaScript'
import { allReactProblems } from './seedReact'
import { allAngularProblems } from './seedAngular'
import { allRxjsProblems } from './seedRxjs'
import { allSystemDesignProblems } from './seedSystemDesign'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SQL_DIR = join(__dirname, 'sql')
mkdirSync(SQL_DIR, { recursive: true })

function esc(v: string | number | null | undefined): string {
  if (v == null) return 'NULL'
  if (typeof v === 'number') return String(v)
  return `'${String(v).replace(/'/g, "''")}'`
}

const COLS =
  '(id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source)'

type AnyProblem = {
  id?: string | null
  title?: string | null
  topic?: string | null
  subtopic?: string | null
  difficulty?: string | null
  platform?: string | null
  platformLink?: string | null
  estimatedMinutes?: number | null
  sheet?: string | null
  problemNumber?: number | null
  tags?: string | null
  questionType?: string | null
  subject?: string | null
  content?: string | null
  contentSource?: string | null
}

function toInsertRow(p: AnyProblem): string {
  const vals = [
    esc(p.id),
    esc(p.title),
    esc(p.topic),
    esc(p.subtopic),
    esc(p.difficulty),
    esc(p.platform),
    esc(p.platformLink),
    esc(p.estimatedMinutes),
    esc(p.sheet),
    esc(p.problemNumber),
    esc(p.tags),
    esc(p.questionType),
    esc(p.subject),
    esc(p.content),
    esc(p.contentSource),
  ].join(', ')
  return `INSERT OR IGNORE INTO problems ${COLS} VALUES (${vals});`
}

function writeSql(name: string, label: string, rows: AnyProblem[]): void {
  const header = [
    `-- PrepArena seed: ${label}`,
    `-- Problems: ${rows.length}`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- Apply (local):  npx wrangler d1 execute preParena-db --local  --file=src/scripts/sql/${name}.sql`,
    `-- Apply (remote): npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/${name}.sql`,
    '',
  ].join('\n')

  const sql = header + rows.map(toInsertRow).join('\n') + '\n'
  const outPath = join(SQL_DIR, `${name}.sql`)
  writeFileSync(outPath, sql, 'utf-8')
  console.log(`✓ Wrote ${rows.length} INSERT statements → src/scripts/sql/${name}.sql`)
}

writeSql('java', 'Java Theory + MCQ', allJavaProblems)
writeSql('oops', 'OOPs Theory + MCQ', allOopsProblems)
writeSql('spring', 'Spring Boot Theory', allSpringProblems)
writeSql('sql-theory', 'SQL Theory', allSqlTheoryProblems)
writeSql('sql-coding', 'SQL Coding (LeetCode SQL 50 + HackerRank SQL)', allSqlCodingProblems)
writeSql('javascript', 'JavaScript Theory + MCQ', allJavaScriptProblems)
writeSql('react', 'React Theory + MCQ', allReactProblems)
writeSql('angular', 'Angular Theory + MCQ', allAngularProblems)
writeSql('rxjs', 'RxJS Theory + MCQ', allRxjsProblems)
writeSql('system-design', 'System Design Theory + MCQ', allSystemDesignProblems)

const total =
  allJavaProblems.length +
  allOopsProblems.length +
  allSpringProblems.length +
  allSqlTheoryProblems.length +
  allSqlCodingProblems.length +
  allJavaScriptProblems.length +
  allReactProblems.length +
  allAngularProblems.length +
  allRxjsProblems.length +
  allSystemDesignProblems.length

console.log(`\nDone. ${total} total rows across 10 SQL files.`)
console.log('Run each with: npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/<name>.sql')
