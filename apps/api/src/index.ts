import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from './types/env'
import auth from './routes/auth'
import problemsRouter from './routes/problems'
import progressRouter from './routes/progress'
import friendsRouter from './routes/friends'
import leaderboardRouter from './routes/leaderboard'
import battlesRouter, { internalBattlesRouter } from './routes/battles'
import feedRouter from './routes/feed'

// Durable Object classes must be exported from the main entry point
export { UserFeed } from './durable/UserFeed'
export { BattleRoom } from './durable/BattleRoom'

const app = new Hono<AppEnv>()

app.use('*', (c, next) =>
  cors({
    origin: c.env.FRONTEND_URL,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })(c, next),
)

app.get('/health', (c) =>
  c.json({ status: 'ok', service: 'PrepArena API', timestamp: new Date().toISOString() }),
)

app.route('/auth', auth)
app.route('/api/problems', problemsRouter)
app.route('/api/progress', progressRouter)
app.route('/api/friends', friendsRouter)
app.route('/api/leaderboard', leaderboardRouter)
app.route('/api/battles', battlesRouter)
app.route('/api/feed', feedRouter)
app.route('/internal/battles', internalBattlesRouter)

export default app
