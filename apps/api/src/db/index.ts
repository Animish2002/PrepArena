import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'
import type { Env } from '../types/env'

export type { Env }

export const getDb = (env: Pick<Env, 'DB'>) => drizzle(env.DB, { schema })

export type DB = ReturnType<typeof getDb>
