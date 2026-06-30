import { allProblems, seedProblems } from './seedProblems'
import { allJavaProblems, seedJava } from './seedJava'
import { allOopsProblems, seedOops } from './seedOops'
import { allSpringProblems, seedSpring } from './seedSpring'
import { allSqlTheoryProblems, seedSqlTheory } from './seedSqlTheory'
import { allSqlCodingProblems, seedSqlCoding } from './seedSqlCoding'

export async function seedAll(d1: D1Database): Promise<void> {
  console.log('=== PrepArena Full Seed ===')
  console.log(
    `Total problems to seed: ${
      allProblems.length +
      allJavaProblems.length +
      allOopsProblems.length +
      allSpringProblems.length +
      allSqlTheoryProblems.length +
      allSqlCodingProblems.length
    }`,
  )
  console.log('')

  // Run each seeder in sequence to avoid D1 concurrent write issues
  await seedProblems(d1)
  const sqlCodingCount = await seedSqlCoding(d1)
  const sqlTheoryCount = await seedSqlTheory(d1)
  const javaCount = await seedJava(d1)
  const oopsCount = await seedOops(d1)
  const springCount = await seedSpring(d1)

  const total = allProblems.length + sqlCodingCount + sqlTheoryCount + javaCount + oopsCount + springCount

  console.log('')
  console.log('=== Seed Summary ===')
  console.log(`  DSA:         ${allProblems.length}`)
  console.log(`  SQL Coding:  ${sqlCodingCount}`)
  console.log(`  SQL Theory:  ${sqlTheoryCount}`)
  console.log(`  Java:        ${javaCount}`)
  console.log(`  OOPs:        ${oopsCount}`)
  console.log(`  Spring Boot: ${springCount}`)
  console.log(`  ─────────────────`)
  console.log(`  Total inserted: ${total}`)
}
