import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { SignJWT } from 'jose'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { users, userRatings } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

const auth = new Hono<AppEnv>()

// ─── Helpers ──────────────────────────────────────────────────────────────────

type GoogleUser = {
  id: string
  email: string
  name: string
  picture: string
  verified_email: boolean
}

function slugifyName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || 'user'
}

async function resolveUsername(db: ReturnType<typeof getDb>, base: string): Promise<string> {
  const taken = await db.select({ username: users.username }).from(users).where(eq(users.username, base)).limit(1)
  if (taken.length === 0) return base

  for (let i = 0; i < 10; i++) {
    const candidate = `${base}-${String(Math.floor(1000 + Math.random() * 9000))}`
    const rows = await db.select({ username: users.username }).from(users).where(eq(users.username, candidate)).limit(1)
    if (rows.length === 0) return candidate
  }

  return `${base}-${Date.now()}`
}

async function signJwt(secret: string, payload: { sub: string; email: string; username: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secret))
}

function setSessionCookie(c: Parameters<typeof setCookie>[0], token: string) {
  setCookie(c, 'preParena_session', token, {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

// ─── GET /auth/google ─────────────────────────────────────────────────────────

auth.get('/google', async (c) => {
  const state = crypto.randomUUID()
  await c.env.KV.put(`oauth_state:${state}`, '1', { expirationTtl: 600 })

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: c.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  })

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

// ─── GET /auth/google/callback ────────────────────────────────────────────────

auth.get('/google/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const oauthError = c.req.query('error')

  if (oauthError) {
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=oauth_denied`)
  }

  if (!code || !state) {
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=missing_params`)
  }

  // ── CSRF: verify state from KV ──────────────────────────────────────────
  const storedState = await c.env.KV.get(`oauth_state:${state}`)
  if (!storedState) {
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=invalid_state`)
  }
  await c.env.KV.delete(`oauth_state:${state}`)

  // ── Exchange code for tokens ────────────────────────────────────────────
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: c.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=token_exchange_failed`)
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string }

  if (!tokenData.access_token) {
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=no_access_token`)
  }

  // ── Fetch Google user profile ───────────────────────────────────────────
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!profileRes.ok) {
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=profile_fetch_failed`)
  }

  const googleUser = (await profileRes.json()) as GoogleUser

  // ── Upsert user ─────────────────────────────────────────────────────────
  const db = getDb(c.env)

  const [existingUser] = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1)

  let userId: string
  let username: string

  if (existingUser) {
    // Refresh avatar in case it changed
    await db.update(users).set({ avatarUrl: googleUser.picture }).where(eq(users.id, existingUser.id))
    userId = existingUser.id
    username = existingUser.username
  } else {
    userId = crypto.randomUUID()
    const baseSlug = slugifyName(googleUser.name)
    username = await resolveUsername(db, baseSlug)

    await db.insert(users).values({
      id: userId,
      email: googleUser.email,
      name: googleUser.name,
      username,
      avatarUrl: googleUser.picture,
      createdAt: Date.now(),
    })

    await db.insert(userRatings).values({
      userId,
      rating: 1200,
      battlesWon: 0,
      battlesLost: 0,
    })
  }

  // ── Issue token — pass in URL so cross-domain cookies are not needed ───
  const token = await signJwt(c.env.JWT_SECRET, { sub: userId, email: googleUser.email, username })
  setSessionCookie(c, token) // keep cookie as fallback for same-domain setups

  return c.redirect(`${c.env.FRONTEND_URL}/auth/callback?token=${token}`)
})

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user })
})

// ─── POST /auth/logout ────────────────────────────────────────────────────────

auth.post('/logout', (c) => {
  deleteCookie(c, 'preParena_session', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    path: '/',
  })
  return c.json({ success: true })
})

export default auth
