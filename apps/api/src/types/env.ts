export interface Env {
  DB: D1Database
  KV: KVNamespace
  R2: R2Bucket
  JWT_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_REDIRECT_URI: string
  FRONTEND_URL: string
  WORKER_URL: string
  INTERNAL_SECRET: string
  ADMIN_KEY: string
  USER_FEED: DurableObjectNamespace
  BATTLE_ROOM: DurableObjectNamespace
}

export interface Variables {
  userId: string
}

export type AppEnv = {
  Bindings: Env
  Variables: Variables
}
