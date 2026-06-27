import { Hono } from 'hono'
import { and, eq, inArray, or, sql } from 'drizzle-orm'
import { getDb } from '../db'
import { activityLog, battles, problems, userProgress, userRatings, users } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

// ─── Public router ─────────────────────────────────────────────────────────────
const router = new Hono<AppEnv>()

// ─── Internal router (no auth — validated via X-Internal-Secret header) ────────
export const internalBattlesRouter = new Hono<AppEnv>()

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RATING_DELTA = 35

function pickWithVariety(pool: { id: string; topic: string }[], n: number): string[] {
  if (pool.length === 0) return []
  if (pool.length <= n) return pool.map((p) => p.id)

  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const selected: typeof pool = []
  const usedTopics = new Set<string>()

  // First pass: prefer different topics
  for (const p of shuffled) {
    if (selected.length >= n) break
    if (!usedTopics.has(p.topic)) {
      selected.push(p)
      usedTopics.add(p.topic)
    }
  }

  // Second pass: fill remaining slots from any problem
  for (const p of shuffled) {
    if (selected.length >= n) break
    if (!selected.some((s) => s.id === p.id)) selected.push(p)
  }

  return selected.map((p) => p.id)
}

async function selectBattleProblems(
  db: ReturnType<typeof getDb>,
  challengerId: string,
): Promise<string[]> {
  const [easySolved, mediumSolved, hardSolved] = await Promise.all([
    db
      .select({ id: problems.id, topic: problems.topic })
      .from(userProgress)
      .innerJoin(problems, eq(userProgress.problemId, problems.id))
      .where(
        and(
          eq(userProgress.userId, challengerId),
          eq(userProgress.status, 'solved'),
          eq(problems.difficulty, 'easy'),
        ),
      ),
    db
      .select({ id: problems.id, topic: problems.topic })
      .from(userProgress)
      .innerJoin(problems, eq(userProgress.problemId, problems.id))
      .where(
        and(
          eq(userProgress.userId, challengerId),
          eq(userProgress.status, 'solved'),
          eq(problems.difficulty, 'medium'),
        ),
      ),
    db
      .select({ id: problems.id, topic: problems.topic })
      .from(userProgress)
      .innerJoin(problems, eq(userProgress.problemId, problems.id))
      .where(
        and(
          eq(userProgress.userId, challengerId),
          eq(userProgress.status, 'solved'),
          eq(problems.difficulty, 'hard'),
        ),
      ),
  ])

  // Fall back to the full problem pool per difficulty if too few solved
  const [allEasy, allMedium, allHard] = await Promise.all([
    easySolved.length >= 2
      ? ([] as { id: string; topic: string }[])
      : db
          .select({ id: problems.id, topic: problems.topic })
          .from(problems)
          .where(eq(problems.difficulty, 'easy')),
    mediumSolved.length >= 2
      ? ([] as { id: string; topic: string }[])
      : db
          .select({ id: problems.id, topic: problems.topic })
          .from(problems)
          .where(eq(problems.difficulty, 'medium')),
    hardSolved.length >= 1
      ? ([] as { id: string; topic: string }[])
      : db
          .select({ id: problems.id, topic: problems.topic })
          .from(problems)
          .where(eq(problems.difficulty, 'hard')),
  ])

  const easyPool = easySolved.length >= 2 ? easySolved : allEasy
  const mediumPool = mediumSolved.length >= 2 ? mediumSolved : allMedium
  const hardPool = hardSolved.length >= 1 ? hardSolved : allHard

  return [
    ...pickWithVariety(easyPool, 2),
    ...pickWithVariety(mediumPool, 2),
    ...pickWithVariety(hardPool, 1),
  ].slice(0, 5)
}

// ─── POST /battles/challenge ──────────────────────────────────────────────────

router.post('/challenge', authMiddleware, async (c) => {
  const challengerId = c.get('userId')
  const { opponent_id: opponentId } = await c.req.json<{ opponent_id: string }>()
  const db = getDb(c.env)

  if (challengerId === opponentId) return c.json({ error: 'Cannot challenge yourself' }, 400)

  const [opponent] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, opponentId))
    .limit(1)
  if (!opponent) return c.json({ error: 'Opponent not found' }, 404)

  const selectedIds = await selectBattleProblems(db, challengerId)
  if (selectedIds.length < 5) {
    return c.json({ error: 'Not enough problems available to start a battle' }, 400)
  }

  const battleId = crypto.randomUUID()
  const now = Date.now()

  await db.insert(battles).values({
    id: battleId,
    challengerId,
    opponentId,
    status: 'pending',
    problemIds: JSON.stringify(selectedIds),
  })

  const [challengerUser] = await db
    .select({ name: users.name, username: users.username, avatarUrl: users.avatarUrl })
    .from(users).where(eq(users.id, challengerId)).limit(1)

  await Promise.all([
    db.insert(activityLog).values({
      id: crypto.randomUUID(),
      userId: challengerId,
      type: 'battle_challenged',
      payload: JSON.stringify({ battle_id: battleId, opponent_id: opponentId }),
      createdAt: now,
    }),
    db.insert(activityLog).values({
      id: crypto.randomUUID(),
      userId: opponentId,
      type: 'battle_received',
      payload: JSON.stringify({ battle_id: battleId, challenger_id: challengerId }),
      createdAt: now,
    }),
  ])

  // Push real-time notification to the challenged user
  if (challengerUser) {
    try {
      const doId = c.env.USER_FEED.idFromName(opponentId)
      const stub = c.env.USER_FEED.get(doId)
      await stub.fetch('https://internal/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          type: 'battle_challenged',
          payload: JSON.stringify({ battle_id: battleId }),
          createdAt: now,
          userId: challengerId,
          username: challengerUser.username,
          name: challengerUser.name,
          avatarUrl: challengerUser.avatarUrl,
        }),
      })
    } catch {
      // Non-fatal
    }
  }

  return c.json({ battle_id: battleId })
})

// ─── GET /battles/history (must be before /:id routes) ───────────────────────

router.get('/history', authMiddleware, async (c) => {
  const userId = c.get('userId')

  const { results } = await c.env.DB.prepare(`
    SELECT
      b.id,
      b.status,
      b.started_at,
      b.ended_at,
      b.winner_id,
      b.problem_ids,
      CASE WHEN b.winner_id = ? THEN 1 ELSE 0 END AS won,
      CASE WHEN b.challenger_id = ?
        THEN b.challenger_rating_delta
        ELSE b.opponent_rating_delta
      END AS rating_delta,
      CASE WHEN b.challenger_id = ?
        THEN opp.id ELSE chal.id
      END AS opponent_id,
      CASE WHEN b.challenger_id = ?
        THEN opp.username ELSE chal.username
      END AS opponent_username,
      CASE WHEN b.challenger_id = ?
        THEN opp.avatar_url ELSE chal.avatar_url
      END AS opponent_avatar
    FROM battles b
    LEFT JOIN users chal ON chal.id = b.challenger_id
    LEFT JOIN users opp  ON opp.id  = b.opponent_id
    WHERE b.challenger_id = ? OR b.opponent_id = ?
    ORDER BY COALESCE(b.ended_at, b.started_at) DESC
    LIMIT 50
  `)
    .bind(userId, userId, userId, userId, userId, userId, userId)
    .all()

  return c.json({ history: results })
})

// ─── POST /battles/:id/accept ─────────────────────────────────────────────────

router.post('/:id/accept', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const battleId = c.req.param('id')
  const db = getDb(c.env)

  const [battle] = await db.select().from(battles).where(eq(battles.id, battleId)).limit(1)
  if (!battle) return c.json({ error: 'Battle not found' }, 404)
  if (battle.opponentId !== userId) return c.json({ error: 'Only the opponent can accept' }, 403)
  if (battle.status !== 'pending') return c.json({ error: 'Battle already active or completed' }, 400)

  const now = Date.now()
  await db.update(battles).set({ status: 'active', startedAt: now }).where(eq(battles.id, battleId))

  return c.json({
    battle_id: battleId,
    problem_ids: JSON.parse(battle.problemIds ?? '[]') as string[],
    websocket_url: `/battles/${battleId}/ws`,
  })
})

// ─── GET /battles/:id/ws ──────────────────────────────────────────────────────

router.get('/:id/ws', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const battleId = c.req.param('id')
  const db = getDb(c.env)

  const [battle] = await db.select().from(battles).where(eq(battles.id, battleId)).limit(1)
  if (!battle) return c.json({ error: 'Battle not found' }, 404)
  if (battle.challengerId !== userId && battle.opponentId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  if (battle.status !== 'active') return c.json({ error: 'Battle not active' }, 400)

  const doId = c.env.BATTLE_ROOM.idFromName(battleId)
  const stub = c.env.BATTLE_ROOM.get(doId)

  const url = new URL(c.req.url)
  url.searchParams.set('user_id', userId)
  url.searchParams.set('battle_id', battleId)

  return stub.fetch(new Request(url.toString(), c.req.raw))
})

// ─── POST /internal/battles/:id/complete (via internalBattlesRouter) ─────────

internalBattlesRouter.post('/:id/complete', async (c) => {
  const secret = c.req.header('X-Internal-Secret')
  if (!secret || secret !== c.env.INTERNAL_SECRET) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const battleId = c.req.param('id')
  const body = await c.req.json<{
    winner_id: string | null
    scores: Record<string, number>
    challenger_id: string
    opponent_id: string
  }>()

  const db = getDb(c.env)
  const now = Date.now()
  const { winner_id: winnerId, challenger_id: challengerId, opponent_id: opponentId } = body

  if (winnerId) {
    const loserId = winnerId === challengerId ? opponentId : challengerId
    const chalDelta = challengerId === winnerId ? RATING_DELTA : -RATING_DELTA
    const oppDelta = opponentId === winnerId ? RATING_DELTA : -RATING_DELTA

    await Promise.all([
      db.update(battles).set({
        status: 'completed',
        winnerId,
        endedAt: now,
        challengerRatingDelta: chalDelta,
        opponentRatingDelta: oppDelta,
      }).where(eq(battles.id, battleId)),

      db.update(userRatings).set({
        rating: sql`${userRatings.rating} + ${RATING_DELTA}`,
        battlesWon: sql`${userRatings.battlesWon} + 1`,
      }).where(eq(userRatings.userId, winnerId)),

      db.update(userRatings).set({
        rating: sql`MAX(0, ${userRatings.rating} - ${RATING_DELTA})`,
        battlesLost: sql`${userRatings.battlesLost} + 1`,
      }).where(eq(userRatings.userId, loserId)),

      db.insert(activityLog).values({
        id: crypto.randomUUID(),
        userId: winnerId,
        type: 'battle_won',
        payload: JSON.stringify({ battle_id: battleId, rating_delta: RATING_DELTA }),
        createdAt: now,
      }),
      db.insert(activityLog).values({
        id: crypto.randomUUID(),
        userId: loserId,
        type: 'battle_lost',
        payload: JSON.stringify({ battle_id: battleId, rating_delta: -RATING_DELTA }),
        createdAt: now,
      }),
    ])
  } else {
    // Tie — no rating change
    await db.update(battles).set({
      status: 'completed',
      endedAt: now,
      challengerRatingDelta: 0,
      opponentRatingDelta: 0,
    }).where(eq(battles.id, battleId))
  }

  return c.json({ success: true })
})

// ─── GET /battles/pending ─────────────────────────────────────────────────────

router.get('/pending', authMiddleware, async (c) => {
  const userId = c.get('userId')

  const { results } = await c.env.DB.prepare(`
    SELECT
      b.id,
      b.challenger_id,
      b.opponent_id,
      chal.name        AS challenger_name,
      chal.username    AS challenger_username,
      chal.avatar_url  AS challenger_avatar,
      opp.name         AS opponent_name,
      opp.username     AS opponent_username,
      opp.avatar_url   AS opponent_avatar
    FROM battles b
    LEFT JOIN users chal ON chal.id = b.challenger_id
    LEFT JOIN users opp  ON opp.id  = b.opponent_id
    WHERE b.status = 'pending'
      AND (b.challenger_id = ? OR b.opponent_id = ?)
    ORDER BY rowid DESC
  `).bind(userId, userId).all<{
    id: string
    challenger_id: string; opponent_id: string
    challenger_name: string; challenger_username: string; challenger_avatar: string | null
    opponent_name: string; opponent_username: string; opponent_avatar: string | null
  }>()

  return c.json({
    sent: results
      .filter((r) => r.challenger_id === userId)
      .map((r) => ({
        id: r.id,
        opponent: { id: r.opponent_id, name: r.opponent_name, username: r.opponent_username, avatarUrl: r.opponent_avatar },
      })),
    received: results
      .filter((r) => r.opponent_id === userId)
      .map((r) => ({
        id: r.id,
        challenger: { id: r.challenger_id, name: r.challenger_name, username: r.challenger_username, avatarUrl: r.challenger_avatar },
      })),
  })
})

// ─── GET /battles/:id ─────────────────────────────────────────────────────────

router.get('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const battleId = c.req.param('id')
  const db = getDb(c.env)

  const [battle] = await db.select().from(battles).where(eq(battles.id, battleId)).limit(1)
  if (!battle) return c.json({ error: 'Not found' }, 404)
  if (battle.challengerId !== userId && battle.opponentId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const [chalUser, oppUser] = await Promise.all([
    db.select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
      .from(users).where(eq(users.id, battle.challengerId)).limit(1),
    db.select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
      .from(users).where(eq(users.id, battle.opponentId)).limit(1),
  ])

  const problemIds = JSON.parse(battle.problemIds ?? '[]') as string[]
  const battleProblems = problemIds.length > 0
    ? await db.select({ id: problems.id, title: problems.title, difficulty: problems.difficulty, platform: problems.platform, platformLink: problems.platformLink })
        .from(problems).where(inArray(problems.id, problemIds))
    : []

  const orderedProblems = problemIds.map((id) => battleProblems.find((p) => p.id === id)).filter(Boolean)

  return c.json({
    id: battle.id,
    status: battle.status,
    challenger: chalUser[0] ?? null,
    opponent: oppUser[0] ?? null,
    problems: orderedProblems,
    startedAt: battle.startedAt,
    endedAt: battle.endedAt,
    winnerId: battle.winnerId,
    challengerRatingDelta: battle.challengerRatingDelta,
    opponentRatingDelta: battle.opponentRatingDelta,
    iAmChallenger: battle.challengerId === userId,
  })
})

// ─── POST /battles/:id/decline ────────────────────────────────────────────────

router.post('/:id/decline', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const battleId = c.req.param('id')
  const db = getDb(c.env)

  const [battle] = await db.select().from(battles).where(eq(battles.id, battleId)).limit(1)
  if (!battle) return c.json({ error: 'Not found' }, 404)
  if (battle.opponentId !== userId) return c.json({ error: 'Only the opponent can decline' }, 403)
  if (battle.status !== 'pending') return c.json({ error: 'Battle is no longer pending' }, 400)

  await db.delete(battles).where(eq(battles.id, battleId))
  return c.json({ ok: true })
})

export default router
