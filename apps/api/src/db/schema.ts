import { sqliteTable, text, integer, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core'

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at'),
})

// ─── Problems ────────────────────────────────────────────────────────────────

export const problems = sqliteTable('problems', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  topic: text('topic').notNull(),
  subtopic: text('subtopic'),
  // 'easy' | 'medium' | 'hard'
  difficulty: text('difficulty'),
  // 'leetcode' | 'gfg' | 'codechef'
  platform: text('platform'),
  platformLink: text('platform_link'),
  estimatedMinutes: integer('estimated_minutes'),
  // 'striver-a2z'
  sheet: text('sheet'),
  problemNumber: integer('problem_number'),
  // JSON stringified string[]
  tags: text('tags'),
})

// ─── Friendships ─────────────────────────────────────────────────────────────

export const friendships = sqliteTable('friendships', {
  id: text('id').primaryKey(),
  userA: text('user_a').notNull().references(() => users.id),
  userB: text('user_b').notNull().references(() => users.id),
  // 'pending' | 'accepted'
  status: text('status').notNull().default('pending'),
  createdAt: integer('created_at'),
})

// ─── Friend Invites ───────────────────────────────────────────────────────────

export const friendInvites = sqliteTable('friend_invites', {
  id: text('id').primaryKey(),
  senderId: text('sender_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at'),
  // boolean as 0 | 1
  used: integer('used').notNull().default(0),
})

// ─── User Progress ────────────────────────────────────────────────────────────

export const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  problemId: text('problem_id').notNull().references(() => problems.id),
  // 'unseen' | 'attempted' | 'solved'
  status: text('status').notNull().default('unseen'),
  // 1=didnt_get | 2=needs_revision | 3=good | 4=mastered
  confidence: integer('confidence'),
  attempts: integer('attempts').notNull().default(0),
  firstSolvedAt: integer('first_solved_at'),
  lastSolvedAt: integer('last_solved_at'),
}, (table) => [
  uniqueIndex('user_progress_user_problem_idx').on(table.userId, table.problemId),
])

// ─── Solve Sessions ───────────────────────────────────────────────────────────

export const solveSessions = sqliteTable('solve_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  problemId: text('problem_id').notNull().references(() => problems.id),
  startedAt: integer('started_at'),
  endedAt: integer('ended_at'),
  durationSeconds: integer('duration_seconds'),
})

// ─── Revision Schedule ────────────────────────────────────────────────────────

export const revisionSchedule = sqliteTable('revision_schedule', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  problemId: text('problem_id').notNull().references(() => problems.id),
  dueDate: integer('due_date'),
  completed: integer('completed').notNull().default(0),
})

// ─── Problem Notes ────────────────────────────────────────────────────────────

export const problemNotes = sqliteTable('problem_notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  problemId: text('problem_id').notNull().references(() => problems.id),
  content: text('content'),
  updatedAt: integer('updated_at'),
}, (table) => [
  uniqueIndex('problem_notes_user_problem_idx').on(table.userId, table.problemId),
])

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export const bookmarks = sqliteTable('bookmarks', {
  userId: text('user_id').notNull().references(() => users.id),
  problemId: text('problem_id').notNull().references(() => problems.id),
  createdAt: integer('created_at'),
}, (table) => [
  primaryKey({ columns: [table.userId, table.problemId] }),
])

// ─── Groups ───────────────────────────────────────────────────────────────────

export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  creatorId: text('creator_id').notNull().references(() => users.id),
  weeklyGoal: integer('weekly_goal').notNull().default(20),
  createdAt: integer('created_at'),
})

// ─── Group Members ────────────────────────────────────────────────────────────

export const groupMembers = sqliteTable('group_members', {
  groupId: text('group_id').notNull().references(() => groups.id),
  userId: text('user_id').notNull().references(() => users.id),
  joinedAt: integer('joined_at'),
}, (table) => [
  primaryKey({ columns: [table.groupId, table.userId] }),
])

// ─── Battles ─────────────────────────────────────────────────────────────────

export const battles = sqliteTable('battles', {
  id: text('id').primaryKey(),
  challengerId: text('challenger_id').notNull().references(() => users.id),
  opponentId: text('opponent_id').notNull().references(() => users.id),
  // 'pending' | 'active' | 'completed'
  status: text('status').notNull().default('pending'),
  // JSON stringified string[] of 5 problem ids
  problemIds: text('problem_ids'),
  startedAt: integer('started_at'),
  endedAt: integer('ended_at'),
  winnerId: text('winner_id'),
  challengerRatingDelta: integer('challenger_rating_delta'),
  opponentRatingDelta: integer('opponent_rating_delta'),
})

// ─── Activity Log ─────────────────────────────────────────────────────────────

export const activityLog = sqliteTable('activity_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  // 'solved' | 'battle_won' | 'streak' | 'revision'
  type: text('type').notNull(),
  // JSON stringified arbitrary payload
  payload: text('payload'),
  createdAt: integer('created_at'),
})

// ─── User Ratings ─────────────────────────────────────────────────────────────

export const userRatings = sqliteTable('user_ratings', {
  userId: text('user_id').primaryKey().references(() => users.id),
  rating: integer('rating').notNull().default(1200),
  battlesWon: integer('battles_won').notNull().default(0),
  battlesLost: integer('battles_lost').notNull().default(0),
})

// ─── User XP ──────────────────────────────────────────────────────────────────

export const userXp = sqliteTable('user_xp', {
  userId: text('user_id').primaryKey().references(() => users.id),
  totalXp: integer('total_xp').notNull().default(0),
  weeklyXp: integer('weekly_xp').notNull().default(0),
  monthlyXp: integer('monthly_xp').notNull().default(0),
  // Unix ms timestamps used to detect period rollovers
  weekStart: integer('week_start'),
  monthStart: integer('month_start'),
})

// ─── Weekly Challenges ────────────────────────────────────────────────────────

export const weeklyChallenges = sqliteTable('weekly_challenges', {
  id: text('id').primaryKey(),
  weekStart: integer('week_start').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  // 'topic_blitz' | 'speed_run' | 'accuracy' | 'mixed'
  type: text('type').notNull(),
  // JSON array of 7-10 problem ids
  problemIds: text('problem_ids').notNull(),
  xpReward: integer('xp_reward').notNull().default(200),
  badgeName: text('badge_name').notNull(),
  createdAt: integer('created_at'),
})

// ─── Challenge Completions ────────────────────────────────────────────────────

export const challengeCompletions = sqliteTable('challenge_completions', {
  id: text('id').primaryKey(),
  challengeId: text('challenge_id').notNull().references(() => weeklyChallenges.id),
  userId: text('user_id').notNull().references(() => users.id),
  problemsSolved: integer('problems_solved').notNull().default(0),
  totalProblems: integer('total_problems').notNull(),
  // 1 when all problems solved
  completed: integer('completed').notNull().default(0),
  // sum of solve durations for challenge problems
  totalTimeSeconds: integer('total_time_seconds').notNull().default(0),
  completedAt: integer('completed_at'),
  xpAwarded: integer('xp_awarded').notNull().default(0),
}, (table) => [
  uniqueIndex('challenge_completions_challenge_user_idx').on(table.challengeId, table.userId),
])
