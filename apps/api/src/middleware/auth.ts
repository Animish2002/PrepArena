import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { jwtVerify } from 'jose'
import type { AppEnv } from '../types/env'

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  // Accept Bearer token from Authorization header OR legacy cookie
  const authHeader = c.req.header('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const cookieToken = getCookie(c, 'preParena_session')
  const token = bearerToken ?? cookieToken

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const key = new TextEncoder().encode(c.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, key)

    if (!payload.sub) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('userId', payload.sub)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}
