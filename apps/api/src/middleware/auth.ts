import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { jwtVerify } from 'jose'
import type { AppEnv } from '../types/env'

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  // Accept Bearer token from Authorization header, cookie, or ?token= query param (WebSocket)
  const authHeader = c.req.header('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const cookieToken = getCookie(c, 'preParena_session')
  const queryToken = new URL(c.req.url).searchParams.get('token')
  const token = bearerToken ?? cookieToken ?? queryToken

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
