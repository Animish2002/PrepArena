import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../db'
import { apiTokens } from '../db/schema'
import { authMiddleware } from '../middleware/auth'
import type { AppEnv } from '../types/env'

const router = new Hono<AppEnv>()
router.use('*', authMiddleware)

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── POST /api/tokens — generate a personal access token ─────────────────────
// Returns the plaintext token ONCE. Only the SHA-256 hash is stored.

router.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ label?: string }>().catch(() => ({ label: undefined }))
  const label =
    typeof body.label === 'string' && body.label.trim().length > 0
      ? body.label.trim().slice(0, 80)
      : 'Browser Extension'

  const rawBytes = crypto.getRandomValues(new Uint8Array(32))
  const plaintext =
    'pa_' +
    Array.from(rawBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  const tokenHash = await sha256Hex(plaintext)

  const db = getDb(c.env)
  const id = crypto.randomUUID()
  await db.insert(apiTokens).values({ id, userId, tokenHash, label, createdAt: Date.now(), lastUsedAt: null })

  return c.json({ token: plaintext, label, id }, 201)
})

// ─── GET /api/tokens — list tokens (never plaintext) ─────────────────────────

router.get('/', async (c) => {
  const userId = c.get('userId')
  const db = getDb(c.env)
  const tokens = await db
    .select({ id: apiTokens.id, label: apiTokens.label, createdAt: apiTokens.createdAt, lastUsedAt: apiTokens.lastUsedAt })
    .from(apiTokens)
    .where(eq(apiTokens.userId, userId))
  return c.json({ tokens })
})

// ─── DELETE /api/tokens/:id — revoke a token ─────────────────────────────────

router.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const db = getDb(c.env)

  const deleted = await db
    .delete(apiTokens)
    .where(and(eq(apiTokens.id, id), eq(apiTokens.userId, userId)))
    .returning({ id: apiTokens.id })

  if (deleted.length === 0) return c.json({ error: 'Token not found' }, 404)
  return c.json({ success: true })
})

export default router
