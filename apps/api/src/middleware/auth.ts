import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { jwtVerify } from 'jose'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { apiTokens } from '../db/schema'
import type { AppEnv } from '../types/env'

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function extractToken(c: Parameters<MiddlewareHandler<AppEnv>>[0]): string | null {
  const authHeader = c.req.header('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const cookieToken = getCookie(c, 'preParena_session')
  const queryToken = new URL(c.req.url).searchParams.get('token')
  return bearerToken ?? cookieToken ?? queryToken
}

// Standard JWT middleware — used on all app routes
export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = extractToken(c)
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const key = new TextEncoder().encode(c.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, key)
    if (!payload.sub) return c.json({ error: 'Unauthorized' }, 401)
    c.set('userId', payload.sub)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}

// Flexible middleware — accepts either a session JWT or a personal API token
// (tokens prefixed with "pa_", stored as SHA-256 hashes in api_tokens table).
// Used on POST /api/progress/complete so the browser extension can call it.
export const flexAuthMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = extractToken(c)
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  // Personal access tokens are identified by the "pa_" prefix
  if (token.startsWith('pa_')) {
    const hash = await sha256Hex(token)
    const db = getDb(c.env)
    const [row] = await db
      .select({ userId: apiTokens.userId, id: apiTokens.id })
      .from(apiTokens)
      .where(eq(apiTokens.tokenHash, hash))
      .limit(1)

    if (!row) return c.json({ error: 'Unauthorized' }, 401)

    await db.update(apiTokens).set({ lastUsedAt: Date.now() }).where(eq(apiTokens.id, row.id))

    c.set('userId', row.userId)
    return await next()
  }

  // Fall back to JWT verification
  try {
    const key = new TextEncoder().encode(c.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, key)
    if (!payload.sub) return c.json({ error: 'Unauthorized' }, 401)
    c.set('userId', payload.sub)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}
