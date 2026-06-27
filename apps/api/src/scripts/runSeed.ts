/**
 * Generates seed.sql from the allProblems data in seedProblems.ts.
 *
 * Run:   npx tsx src/scripts/runSeed.ts
 * Apply: npx wrangler d1 execute preParena-db --local  --file=seed.sql
 *        npx wrangler d1 execute preParena-db --remote --file=seed.sql
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { allProblems } from './seedProblems'

const __dirname = dirname(fileURLToPath(import.meta.url))

function esc(v: string | number | null | undefined): string {
  if (v == null) return 'NULL'
  if (typeof v === 'number') return String(v)
  return `'${String(v).replace(/'/g, "''")}'`
}

const COLS =
  '(id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags)'

const lines = allProblems.map((p) => {
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
  ].join(', ')
  return `INSERT OR IGNORE INTO problems ${COLS} VALUES (${vals});`
})

const header = [
  `-- PrepArena seed: Striver A2Z DSA Sheet`,
  `-- Problems: ${allProblems.length}`,
  `-- Generated: ${new Date().toISOString()}`,
  `-- Apply:  npx wrangler d1 execute preParena-db --local  --file=seed.sql`,
  `--         npx wrangler d1 execute preParena-db --remote --file=seed.sql`,
  '',
].join('\n')

const sql = header + lines.join('\n') + '\n'

const outPath = join(__dirname, '../../seed.sql')
writeFileSync(outPath, sql, 'utf-8')
console.log(`✓ Wrote ${allProblems.length} INSERT statements → apps/api/seed.sql`)
