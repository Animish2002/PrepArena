import { Hono } from 'hono'
import { and, count, eq, inArray, sql } from 'drizzle-orm'
import { getDb } from '../db'
import { groupMembers, groups, solveSessions, users } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

const router = new Hono<AppEnv>()

// ─── GET /groups/ ─────────────────────────────────────────────────────────────

router.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  // Groups the user is a member of
  const myMemberships = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, userId))

  if (myMemberships.length === 0) {
    return c.json({ groups: [] })
  }

  const groupIds = myMemberships.map((m) => m.groupId)

  const groupRows = await db
    .select({
      id: groups.id,
      name: groups.name,
      creatorId: groups.creatorId,
      weeklyGoal: groups.weeklyGoal,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .where(inArray(groups.id, groupIds))

  // Get member counts for each group
  const memberCounts = await db
    .select({ groupId: groupMembers.groupId, memberCount: count() })
    .from(groupMembers)
    .where(inArray(groupMembers.groupId, groupIds))
    .groupBy(groupMembers.groupId)

  const memberCountMap = new Map(memberCounts.map((r) => [r.groupId, r.memberCount]))

  const result = groupRows.map((g) => ({
    ...g,
    memberCount: memberCountMap.get(g.id) ?? 0,
  }))

  return c.json({ groups: result })
})

// ─── POST /groups/ ────────────────────────────────────────────────────────────

router.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ name: string; weekly_goal?: number }>()
  const db = getDb(c.env)
  const now = Date.now()

  if (!body.name || body.name.trim().length === 0) {
    return c.json({ error: 'Group name is required' }, 400)
  }

  const groupId = crypto.randomUUID()

  await db.insert(groups).values({
    id: groupId,
    name: body.name.trim(),
    creatorId: userId,
    weeklyGoal: body.weekly_goal ?? 20,
    createdAt: now,
  })

  await db.insert(groupMembers).values({
    groupId,
    userId,
    joinedAt: now,
  })

  return c.json({ group_id: groupId })
})

// ─── GET /groups/:id ──────────────────────────────────────────────────────────

router.get('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const groupId = c.req.param('id')
  const db = getDb(c.env)

  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1)

  if (!group) return c.json({ error: 'Group not found' }, 404)

  // Verify the requester is a member
  const [membership] = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1)

  if (!membership) return c.json({ error: 'Not a member of this group' }, 403)

  // Get all members with user info
  const memberRows = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
      joinedAt: groupMembers.joinedAt,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))

  const memberIds = memberRows.map((m) => m.id)

  // Weekly solve count per member using raw D1 SQL
  const weekStart = (() => {
    const now = Date.now()
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - d.getDay())
    return d.getTime()
  })()

  let weeklySolvedMap = new Map<string, number>()

  if (memberIds.length > 0) {
    const placeholders = memberIds.map(() => '?').join(', ')
    const query = `SELECT s.user_id, COUNT(*) as cnt FROM solve_sessions s WHERE s.user_id IN (${placeholders}) AND s.started_at >= ? GROUP BY s.user_id`
    const params = [...memberIds, weekStart]

    const result = await c.env.DB.prepare(query)
      .bind(...params)
      .all<{ user_id: string; cnt: number }>()

    weeklySolvedMap = new Map(result.results.map((r) => [r.user_id, r.cnt]))
  }

  const members = memberRows.map((m) => ({
    id: m.id,
    name: m.name,
    username: m.username,
    avatarUrl: m.avatarUrl,
    joinedAt: m.joinedAt,
    weeklySolved: weeklySolvedMap.get(m.id) ?? 0,
  }))

  return c.json({
    id: group.id,
    name: group.name,
    weeklyGoal: group.weeklyGoal,
    creatorId: group.creatorId,
    members,
  })
})

// ─── POST /groups/:id/members ─────────────────────────────────────────────────

router.post('/:id/members', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const groupId = c.req.param('id')
  const body = await c.req.json<{ user_id: string }>()
  const db = getDb(c.env)

  const [group] = await db
    .select({ id: groups.id, creatorId: groups.creatorId })
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1)

  if (!group) return c.json({ error: 'Group not found' }, 404)
  if (group.creatorId !== userId) return c.json({ error: 'Only the creator can add members' }, 403)

  if (!body.user_id) return c.json({ error: 'user_id is required' }, 400)

  await db
    .insert(groupMembers)
    .values({
      groupId,
      userId: body.user_id,
      joinedAt: Date.now(),
    })
    .onConflictDoNothing()

  return c.json({ success: true })
})

export default router
