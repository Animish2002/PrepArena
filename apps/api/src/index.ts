import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from './types/env'
import type { Env } from './types/env'
import auth from './routes/auth'
import problemsRouter from './routes/problems'
import progressRouter from './routes/progress'
import friendsRouter from './routes/friends'
import leaderboardRouter from './routes/leaderboard'
import battlesRouter, { internalBattlesRouter } from './routes/battles'
import feedRouter from './routes/feed'
import profileRouter from './routes/profile'
import groupsRouter from './routes/groups'
import challengesRouter, { autoCreateWeeklyChallenge } from './routes/challenges'
import chatRouter, { internalChatRouter } from './routes/chat'
import leetcodeRouter from './routes/leetcode'
import tokensRouter from './routes/tokens'
import extensionRouter from './routes/extension'

// Durable Object classes must be exported from the main entry point
export { UserFeed } from './durable/UserFeed'
export { BattleRoom } from './durable/BattleRoom'
export { ChatRoom } from './durable/ChatRoom'

const app = new Hono<AppEnv>()

app.use('*', (c, next) =>
  cors({
    origin: c.env.FRONTEND_URL,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })(c, next),
)

app.get('/health', (c) =>
  c.json({ status: 'ok', service: 'PrepArena API', timestamp: new Date().toISOString() }),
)

app.route('/auth', auth)
// extensionRouter must come before progressRouter so /api/progress/complete
// is matched by flexAuthMiddleware (accepts both JWTs and API tokens)
app.route('/api', extensionRouter)
app.route('/api/problems', problemsRouter)
app.route('/api/progress', progressRouter)
app.route('/api/leetcode', leetcodeRouter)
app.route('/api/tokens', tokensRouter)
app.route('/api/friends', friendsRouter)
app.route('/api/leaderboard', leaderboardRouter)
app.route('/api/battles', battlesRouter)
app.route('/api/feed', feedRouter)
app.route('/api/profile', profileRouter)
app.route('/api/groups', groupsRouter)
app.route('/api/challenges', challengesRouter)
app.route('/api/chat', chatRouter)
app.route('/internal/battles', internalBattlesRouter)
app.route('/internal/chat', internalChatRouter)

// ── Scheduled handler — runs every Monday 00:00 UTC (cron: "0 0 * * 1") ──────

export default {
  fetch: app.fetch.bind(app),

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(autoCreateWeeklyChallenge(env))
  },
}
