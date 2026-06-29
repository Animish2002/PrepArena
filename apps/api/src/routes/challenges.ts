import { Hono } from 'hono'
import { and, count, desc, eq, gte, inArray, lte, or, sql } from 'drizzle-orm'
import { getDb } from '../db'
import type { DB } from '../db'
import {
  activityLog,
  challengeCompletions,
  friendships,
  problems,
  solveSessions,
  userProgress,
  userXp,
  users,
  weeklyChallenges,
} from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'
import type { Env } from '../types/env'

const router = new Hono<AppEnv>()

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY = 86_400_000
const WEEK = 7 * DAY

const TOPIC_TITLES: Record<string, string[]> = {
  'Arrays':              ['Array Assault', 'Linear Legends', 'Array Blitz'],
  'Strings':             ['String Slayer', 'Char Crusher', 'Lexical Legends'],
  'Linked List':         ['List Legends', 'Pointer Prowess', 'Node Nemesis'],
  'Stacks & Queues':     ['Stack Storm', 'Queue Conqueror', 'LIFO Lightning'],
  'Trees':               ['Tree Traversal Trials', 'Branch Breaker', 'Root Rush'],
  'Graphs':              ['Graph Gauntlet', 'Node Navigator', 'Edge Explorer'],
  'Dynamic Programming': ['DP Deep Dive', 'Memoization Masters', 'DP Dynasty'],
  'Greedy':              ['Greedy Grit', 'Optimal Outlaws', 'Greedy Gods'],
  'Backtracking':        ['Backtrack Blitz', 'Recursion Rumble', 'Path Predators'],
  'Binary Search':       ['Binary Blitz', 'Log Legends', 'Search Supremacy'],
  'Sorting':             ['Sort Sprint', 'Order Operators', 'Merge Masters'],
  'Heaps':               ['Heap Heroes', 'Priority Prowess', 'Heap Havoc'],
  'Tries':               ['Trie Titans', 'Prefix Predators', 'Trie Takeover'],
  'Sliding Window':      ['Window Warriors', 'Sliding Slayers', 'Frame Fighters'],
  'Two Pointers':        ['Dual Dominators', 'Pointer Pair Pros', 'Two-Pointer Titans'],
  'Bit Manipulation':    ['Bit Blasters', 'XOR Xtremists', 'Binary Brawlers'],
  'Math':                ['Math Mavericks', 'Number Ninjas', 'Formula Fighters'],
}

const TYPE_LABELS: Record<string, string> = {
  topic_blitz: 'Topic Blitz',
  speed_run:   'Speed Run',
  accuracy:    'Accuracy',
  mixed:       'Mixed',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayWeekStart(ts: number): number {
  const d = new Date(ts)
  d.setUTCHours(0, 0, 0, 0)
  const day = d.getUTCDay() // 0=Sun 1=Mon … 6=Sat
  d.setUTCDate(d.getUTCDate() - ((day + 6) % 7))
  return d.getTime()
}

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

async function broadcastToUser(env: Env, targetUserId: string, event: object) {
  try {
    const doId = env.USER_FEED.idFromName(targetUserId)
    const stub = env.USER_FEED.get(doId)
    await stub.fetch(new Request('https://internal/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }))
  } catch {
    // DO may not be active
  }
}

async function broadcastToFriends(env: Env, db: DB, userId: string, event: object) {
  const accepted = await db
    .select({ other: friendships.userA, other2: friendships.userB })
    .from(friendships)
    .where(and(
      or(eq(friendships.userA, userId), eq(friendships.userB, userId)),
      eq(friendships.status, 'accepted'),
    ))

  await Promise.all(
    accepted.map((f) => {
      const friendId = f.other === userId ? f.other2 : f.other
      return broadcastToUser(env, friendId, event)
    }),
  )
}

// ─── Core challenge progress updater (called from progress route too) ─────────

export async function maybeUpdateChallengeProgress(
  db: DB,
  env: Env,
  userId: string,
  problemId: string,
  _durationSeconds: number,
): Promise<{ challengeId: string; problemsSolved: number; totalProblems: number; completed: boolean; xpAwarded: number } | null> {
  const now = Date.now()
  const ws = getMondayWeekStart(now)

  // Find active challenge (current week)
  const [challenge] = await db
    .select()
    .from(weeklyChallenges)
    .where(and(
      lte(weeklyChallenges.weekStart, now),
      gte(weeklyChallenges.weekStart, now - WEEK),
    ))
    .limit(1)

  if (!challenge) return null

  const problemIds: string[] = JSON.parse(challenge.problemIds)
  if (!problemIds.includes(problemId)) return null

  // Count solved challenge problems (idempotent — always recounts)
  const [countRow] = await db
    .select({ cnt: count() })
    .from(userProgress)
    .where(and(
      eq(userProgress.userId, userId),
      eq(userProgress.status, 'solved'),
      inArray(userProgress.problemId, problemIds),
    ))

  const problemsSolved = countRow?.cnt ?? 0
  const totalProblems = problemIds.length

  // Sum total solve time for challenge problems
  const [timeRow] = await db
    .select({ total: sql<number>`COALESCE(SUM(${solveSessions.durationSeconds}), 0)` })
    .from(solveSessions)
    .where(and(
      eq(solveSessions.userId, userId),
      inArray(solveSessions.problemId, problemIds),
    ))

  const totalTimeSeconds = Number(timeRow?.total ?? 0)

  // Get existing completion row
  const [existing] = await db
    .select()
    .from(challengeCompletions)
    .where(and(
      eq(challengeCompletions.challengeId, challenge.id),
      eq(challengeCompletions.userId, userId),
    ))
    .limit(1)

  const wasCompleted = existing?.completed === 1
  const justCompleted = problemsSolved >= totalProblems && !wasCompleted
  const newlySolved = problemsSolved > (existing?.problemsSolved ?? 0)

  // Upsert completion
  await db
    .insert(challengeCompletions)
    .values({
      id: crypto.randomUUID(),
      challengeId: challenge.id,
      userId,
      problemsSolved,
      totalProblems,
      completed: 0,
      totalTimeSeconds,
      xpAwarded: 0,
    })
    .onConflictDoUpdate({
      target: [challengeCompletions.challengeId, challengeCompletions.userId],
      set: {
        problemsSolved,
        totalTimeSeconds,
        completed: justCompleted ? 1 : (existing?.completed ?? 0),
        completedAt: justCompleted ? now : (existing?.completedAt ?? null),
      },
    })

  if (justCompleted) {
    // Award XP
    const xp = challenge.xpReward
    const wss = weekStart(now)
    const ms = monthStart(now)
    await db
      .insert(userXp)
      .values({ userId, totalXp: xp, weeklyXp: xp, monthlyXp: xp, weekStart: wss, monthStart: ms })
      .onConflictDoUpdate({
        target: userXp.userId,
        set: {
          totalXp: sql`${userXp.totalXp} + ${xp}`,
          weeklyXp: sql`CASE WHEN ${userXp.weekStart} = ${wss} THEN ${userXp.weeklyXp} + ${xp} ELSE ${xp} END`,
          monthlyXp: sql`CASE WHEN ${userXp.monthStart} = ${ms} THEN ${userXp.monthlyXp} + ${xp} ELSE ${xp} END`,
          weekStart: wss,
          monthStart: ms,
        },
      })

    await db
      .update(challengeCompletions)
      .set({ xpAwarded: xp })
      .where(and(
        eq(challengeCompletions.challengeId, challenge.id),
        eq(challengeCompletions.userId, userId),
      ))

    // Log activity
    const [solver] = await db
      .select({ name: users.name, username: users.username, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    await db.insert(activityLog).values({
      id: crypto.randomUUID(),
      userId,
      type: 'challenge_completed',
      payload: JSON.stringify({
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        badge_name: challenge.badgeName,
        xp_reward: challenge.xpReward,
      }),
      createdAt: now,
    })

    // Broadcast completion to friends
    await broadcastToFriends(env, db, userId, {
      type: 'challenge_completed',
      userId,
      name: solver?.name ?? '',
      username: solver?.username ?? '',
      avatarUrl: solver?.avatarUrl ?? null,
      challengeTitle: challenge.title,
      badgeName: challenge.badgeName,
    })

    return { challengeId: challenge.id, problemsSolved, totalProblems, completed: true, xpAwarded: xp }
  }

  if (newlySolved) {
    // Broadcast progress to friends so their leaderboard updates live
    const [solver] = await db
      .select({ name: users.name, username: users.username, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    await broadcastToFriends(env, db, userId, {
      type: 'challenge_progress',
      userId,
      name: solver?.name ?? '',
      username: solver?.username ?? '',
      avatarUrl: solver?.avatarUrl ?? null,
      challengeId: challenge.id,
      problemsSolved,
      totalProblems,
      totalTimeSeconds,
    })
  }

  return {
    challengeId: challenge.id,
    problemsSolved,
    totalProblems,
    completed: wasCompleted,
    xpAwarded: existing?.xpAwarded ?? 0,
  }
}

// ─── GET /challenges/current ──────────────────────────────────────────────────

router.get('/current', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)
  const now = Date.now()

  const [challenge] = await db
    .select()
    .from(weeklyChallenges)
    .where(and(
      lte(weeklyChallenges.weekStart, now),
      gte(weeklyChallenges.weekStart, now - WEEK),
    ))
    .limit(1)

  if (!challenge) return c.json({ challenge: null })

  const problemIds: string[] = JSON.parse(challenge.problemIds)

  // Fetch problems + user solve status
  const [challengeProblems, userCompletion, friendAccepted] = await Promise.all([
    db
      .select({
        id: problems.id,
        title: problems.title,
        topic: problems.topic,
        difficulty: problems.difficulty,
        platform: problems.platform,
        platformLink: problems.platformLink,
        estimatedMinutes: problems.estimatedMinutes,
        userStatus: userProgress.status,
      })
      .from(problems)
      .leftJoin(
        userProgress,
        and(eq(userProgress.problemId, problems.id), eq(userProgress.userId, userId)),
      )
      .where(inArray(problems.id, problemIds)),

    db
      .select()
      .from(challengeCompletions)
      .where(and(
        eq(challengeCompletions.challengeId, challenge.id),
        eq(challengeCompletions.userId, userId),
      ))
      .limit(1),

    db
      .select({ other: friendships.userA, other2: friendships.userB })
      .from(friendships)
      .where(and(
        or(eq(friendships.userA, userId), eq(friendships.userB, userId)),
        eq(friendships.status, 'accepted'),
      )),
  ])

  // Preserve problem order from challenge.problemIds
  const problemMap = new Map(challengeProblems.map((p) => [p.id, p]))
  const orderedProblems = problemIds.map((id) => problemMap.get(id)).filter(Boolean)

  // Friend leaderboard
  const friendIds = friendAccepted.map((f) => (f.other === userId ? f.other2 : f.other))
  const participantIds = [userId, ...friendIds]

  const completions = await db
    .select({
      userId: challengeCompletions.userId,
      problemsSolved: challengeCompletions.problemsSolved,
      totalProblems: challengeCompletions.totalProblems,
      completed: challengeCompletions.completed,
      totalTimeSeconds: challengeCompletions.totalTimeSeconds,
      completedAt: challengeCompletions.completedAt,
    })
    .from(challengeCompletions)
    .where(and(
      eq(challengeCompletions.challengeId, challenge.id),
      inArray(challengeCompletions.userId, participantIds),
    ))

  const userRows = await db
    .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
    .from(users)
    .where(inArray(users.id, participantIds))

  const userMap = new Map(userRows.map((u) => [u.id, u]))
  const completionMap = new Map(completions.map((c) => [c.userId, c]))

  // Include all participants (even those with 0 solved)
  const leaderboard = participantIds
    .map((uid) => {
      const comp = completionMap.get(uid)
      const u = userMap.get(uid)
      return {
        userId: uid,
        name: u?.name ?? '',
        username: u?.username ?? '',
        avatarUrl: u?.avatarUrl ?? null,
        problemsSolved: comp?.problemsSolved ?? 0,
        totalProblems: problemIds.length,
        completed: (comp?.completed ?? 0) === 1,
        totalTimeSeconds: comp?.totalTimeSeconds ?? 0,
        completedAt: comp?.completedAt ?? null,
        isCurrentUser: uid === userId,
      }
    })
    .sort((a, b) =>
      b.problemsSolved - a.problemsSolved ||
      a.totalTimeSeconds - b.totalTimeSeconds,
    )
    .map((row, i) => ({ ...row, rank: i + 1 }))

  const uc = userCompletion[0] ?? null

  return c.json({
    challenge: {
      id: challenge.id,
      weekStart: challenge.weekStart,
      weekEnd: challenge.weekStart + WEEK,
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      typeLabel: TYPE_LABELS[challenge.type] ?? challenge.type,
      xpReward: challenge.xpReward,
      badgeName: challenge.badgeName,
      totalProblems: problemIds.length,
      problems: orderedProblems,
    },
    user_completion: uc
      ? {
          problemsSolved: uc.problemsSolved,
          totalProblems: uc.totalProblems,
          completed: uc.completed === 1,
          totalTimeSeconds: uc.totalTimeSeconds,
          completedAt: uc.completedAt,
          xpAwarded: userCompletion[0]?.xpAwarded ?? 0,
        }
      : null,
    leaderboard,
  })
})

// ─── GET /challenges/history ──────────────────────────────────────────────────

router.get('/history', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)
  const now = Date.now()
  const eightWeeksAgo = now - 8 * WEEK

  const past = await db
    .select()
    .from(weeklyChallenges)
    .where(lte(weeklyChallenges.weekStart, now - WEEK))
    .orderBy(desc(weeklyChallenges.weekStart))
    .limit(8)

  if (past.length === 0) return c.json({ history: [] })

  const challengeIds = past.map((c) => c.id)
  const completions = await db
    .select()
    .from(challengeCompletions)
    .where(and(
      inArray(challengeCompletions.challengeId, challengeIds),
      eq(challengeCompletions.userId, userId),
    ))

  const completionMap = new Map(completions.map((c) => [c.challengeId, c]))

  const history = past.map((ch) => {
    const comp = completionMap.get(ch.id)
    return {
      id: ch.id,
      weekStart: ch.weekStart,
      weekEnd: ch.weekStart + WEEK,
      title: ch.title,
      description: ch.description,
      type: ch.type,
      typeLabel: TYPE_LABELS[ch.type] ?? ch.type,
      xpReward: ch.xpReward,
      badgeName: ch.badgeName,
      totalProblems: (JSON.parse(ch.problemIds) as string[]).length,
      completion: comp
        ? {
            problemsSolved: comp.problemsSolved,
            totalProblems: comp.totalProblems,
            completed: comp.completed === 1,
            badgeEarned: comp.completed === 1,
            xpAwarded: comp.xpAwarded,
          }
        : null,
    }
  })

  return c.json({ history })
})

// ─── POST /challenges/current/solve/:problemId ────────────────────────────────

router.post('/current/solve/:problemId', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const problemId = c.req.param('problemId')
  const db = getDb(c.env)

  const result = await maybeUpdateChallengeProgress(db, c.env, userId, problemId, 0)
  if (!result) return c.json({ inChallenge: false })

  return c.json({ inChallenge: true, ...result })
})

// ─── GET /challenges/leaderboard/:challengeId ─────────────────────────────────

router.get('/leaderboard/:challengeId', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const challengeId = c.req.param('challengeId')
  const db = getDb(c.env)

  const [challenge] = await db
    .select()
    .from(weeklyChallenges)
    .where(eq(weeklyChallenges.id, challengeId))
    .limit(1)

  if (!challenge) return c.json({ error: 'Challenge not found' }, 404)

  const problemIds: string[] = JSON.parse(challenge.problemIds)

  // Get all friends for highlighting
  const friendRows = await db
    .select({ other: friendships.userA, other2: friendships.userB })
    .from(friendships)
    .where(and(
      or(eq(friendships.userA, userId), eq(friendships.userB, userId)),
      eq(friendships.status, 'accepted'),
    ))

  const friendSet = new Set([
    userId,
    ...friendRows.map((f) => (f.other === userId ? f.other2 : f.other)),
  ])

  // Top 50 globally
  const top = await db
    .select({
      userId: challengeCompletions.userId,
      problemsSolved: challengeCompletions.problemsSolved,
      totalProblems: challengeCompletions.totalProblems,
      completed: challengeCompletions.completed,
      totalTimeSeconds: challengeCompletions.totalTimeSeconds,
      completedAt: challengeCompletions.completedAt,
    })
    .from(challengeCompletions)
    .where(eq(challengeCompletions.challengeId, challengeId))
    .orderBy(
      desc(challengeCompletions.problemsSolved),
      challengeCompletions.totalTimeSeconds,
    )
    .limit(50)

  const userIds = [...new Set(top.map((r) => r.userId))]
  const userRows = await db
    .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
    .from(users)
    .where(inArray(users.id, userIds))

  const userMap = new Map(userRows.map((u) => [u.id, u]))

  const leaderboard = top.map((row, i) => {
    const u = userMap.get(row.userId)
    return {
      rank: i + 1,
      userId: row.userId,
      name: u?.name ?? '',
      username: u?.username ?? '',
      avatarUrl: u?.avatarUrl ?? null,
      problemsSolved: row.problemsSolved,
      totalProblems: problemIds.length,
      completed: row.completed === 1,
      totalTimeSeconds: row.totalTimeSeconds,
      completedAt: row.completedAt,
      isCurrentUser: row.userId === userId,
      isFriend: friendSet.has(row.userId),
    }
  })

  return c.json({
    challenge: {
      id: challenge.id,
      weekStart: challenge.weekStart,
      title: challenge.title,
      type: challenge.type,
      xpReward: challenge.xpReward,
      badgeName: challenge.badgeName,
      totalProblems: problemIds.length,
    },
    leaderboard,
  })
})

// ─── POST /challenges (admin) ─────────────────────────────────────────────────

router.post('/', async (c) => {
  const adminKey = c.req.header('x-admin-key')
  if (!adminKey || adminKey !== c.env.ADMIN_KEY) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const body = await c.req.json<{
    week_start: number
    title: string
    description: string
    type: string
    problem_ids: string[]
    xp_reward: number
    badge_name: string
  }>()

  const db = getDb(c.env)
  const id = crypto.randomUUID()

  await db.insert(weeklyChallenges).values({
    id,
    weekStart: body.week_start,
    title: body.title,
    description: body.description,
    type: body.type,
    problemIds: JSON.stringify(body.problem_ids),
    xpReward: body.xp_reward,
    badgeName: body.badge_name,
    createdAt: Date.now(),
  })

  return c.json({ id, success: true })
})

// ─── Auto-generation logic (called from scheduled handler) ───────────────────

export async function autoCreateWeeklyChallenge(env: Env): Promise<void> {
  const db = getDb(env)
  const now = Date.now()

  // Next Monday's week start IS this Monday (cron fires Monday 00:00 UTC)
  const thisWeekStart = getMondayWeekStart(now)

  // Check if challenge already exists for this week
  const [existing] = await db
    .select({ id: weeklyChallenges.id })
    .from(weeklyChallenges)
    .where(eq(weeklyChallenges.weekStart, thisWeekStart))
    .limit(1)

  if (existing) return // Already created

  const lastWeekStart = thisWeekStart - WEEK

  // Find topic with fewest total solves last week across all users
  const topicSolves = await db
    .select({
      topic: problems.topic,
      solves: count(activityLog.id),
    })
    .from(problems)
    .leftJoin(activityLog, and(
      eq(activityLog.type, 'solved'),
      gte(activityLog.createdAt, lastWeekStart),
      lte(activityLog.createdAt, thisWeekStart),
      sql`JSON_EXTRACT(${activityLog.payload}, '$.problem_title') IS NOT NULL`,
    ))
    .groupBy(problems.topic)
    .orderBy(count(activityLog.id))

  // Pick least-solved topic that has enough problems
  let chosenTopic: string | null = null
  for (const row of topicSolves) {
    const [cnt] = await db
      .select({ cnt: count() })
      .from(problems)
      .where(eq(problems.topic, row.topic))
    if ((cnt?.cnt ?? 0) >= 7) {
      chosenTopic = row.topic
      break
    }
  }

  if (!chosenTopic) {
    // Fallback: just pick a random topic with enough problems
    const topicsWithEnough = await db
      .select({ topic: problems.topic, cnt: count() })
      .from(problems)
      .groupBy(problems.topic)
      .having(gte(count(), 7))
      .limit(20)
    if (topicsWithEnough.length === 0) return
    chosenTopic = topicsWithEnough[Math.floor(Math.random() * topicsWithEnough.length)].topic
  }

  // Select problems: 3 easy, 3 medium, 1 hard — prefer commonly unsolved ones
  const byDifficulty = async (difficulty: string, limit: number) =>
    db
      .select({ id: problems.id })
      .from(problems)
      .leftJoin(userProgress, and(
        eq(userProgress.problemId, problems.id),
        eq(userProgress.status, 'solved'),
      ))
      .where(and(eq(problems.topic, chosenTopic!), eq(problems.difficulty, difficulty)))
      .groupBy(problems.id)
      .orderBy(count(userProgress.id)) // fewest solves first
      .limit(limit)

  const [easyProblems, mediumProblems, hardProblems] = await Promise.all([
    byDifficulty('easy', 3),
    byDifficulty('medium', 3),
    byDifficulty('hard', 1),
  ])

  const selectedIds = [
    ...easyProblems.map((p) => p.id),
    ...mediumProblems.map((p) => p.id),
    ...hardProblems.map((p) => p.id),
  ]

  if (selectedIds.length < 3) return // Not enough problems

  // Pick title
  const titles = TOPIC_TITLES[chosenTopic] ?? [`${chosenTopic} Challenge`]
  const title = titles[Math.floor(Math.random() * titles.length)]
  const badgeName = title.split(' ').slice(-1)[0] + ' Badge'

  // Determine type based on topic
  const type =
    ['Dynamic Programming', 'Backtracking'].includes(chosenTopic) ? 'accuracy' :
    ['Arrays', 'Strings', 'Sorting', 'Binary Search'].includes(chosenTopic) ? 'speed_run' :
    ['Graphs', 'Trees'].includes(chosenTopic) ? 'topic_blitz' : 'mixed'

  await db.insert(weeklyChallenges).values({
    id: crypto.randomUUID(),
    weekStart: thisWeekStart,
    title,
    description: `This week's challenge focuses on ${chosenTopic}. Solve all ${selectedIds.length} problems to earn the ${badgeName}!`,
    type,
    problemIds: JSON.stringify(selectedIds),
    xpReward: 200,
    badgeName,
    createdAt: now,
  })
}

export default router
