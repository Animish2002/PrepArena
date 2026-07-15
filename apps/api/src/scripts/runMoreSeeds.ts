/**
 * Generates SQL dump files for the supplementary content seed files.
 *
 * Run:   npx tsx src/scripts/runMoreSeeds.ts
 * Apply: npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/<name>.sql
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { allJavaScriptMoreProblems } from './seedJavaScriptMore'
import { allReactMoreProblems } from './seedReactMore'
import { allAngularMoreProblems } from './seedAngularMore'
import { allRxjsMoreProblems } from './seedRxjsMore'
import { allSystemDesignMoreProblems } from './seedSystemDesignMore'
import { allDsaTheoryProblems } from './seedDsaTheory'

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
    `-- Apply (remote): npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/${name}.sql`,
    '',
  ].join('\n')

  const sql = header + rows.map(toInsertRow).join('\n') + '\n'
  const outPath = join(SQL_DIR, `${name}.sql`)
  writeFileSync(outPath, sql, 'utf-8')
  console.log(`✓ Wrote ${rows.length} INSERT statements → src/scripts/sql/${name}.sql`)
}

writeSql('javascript-more', 'JavaScript Extended Theory + MCQ', allJavaScriptMoreProblems)
writeSql('react-more', 'React Extended Theory + MCQ', allReactMoreProblems)
writeSql('angular-more', 'Angular Extended Theory + MCQ', allAngularMoreProblems)
writeSql('rxjs-more', 'RxJS Extended Theory + MCQ', allRxjsMoreProblems)
writeSql('system-design-more', 'System Design Extended Theory + MCQ', allSystemDesignMoreProblems)
writeSql('dsa-theory', 'DSA Theory + MCQ', allDsaTheoryProblems)

const total =
  allJavaScriptMoreProblems.length +
  allReactMoreProblems.length +
  allAngularMoreProblems.length +
  allRxjsMoreProblems.length +
  allSystemDesignMoreProblems.length +
  allDsaTheoryProblems.length

console.log(`\nDone. ${total} total rows across 6 SQL files.`)
