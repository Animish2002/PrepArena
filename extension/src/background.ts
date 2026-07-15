/**
 * background.ts — MV3 service worker.
 *
 * Receives SOLVED messages from content scripts and calls the
 * PrepArena API to mark the problem complete.
 *
 * Uses in-memory debouncing to suppress the multiple check-requests
 * LeetCode fires per submission. The map resets if the service worker
 * is terminated and restarted, but that window is wide enough that
 * duplicate calls within the same submission cycle are never split
 * across a restart.
 */

const DEFAULT_API_BASE = 'https://prep-arena.animishchopade.in'
const DEBOUNCE_MS = 6_000 // LeetCode fires several checks per submission

// slug → timestamp of last handled event
const recentlySeen = new Map<string, number>()

// ── Message listener ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message: unknown) => {
  if (!isSOLVED(message)) return
  const { slug } = message

  // Debounce: ignore duplicate slugs within the debounce window
  const last = recentlySeen.get(slug)
  if (last !== undefined && Date.now() - last < DEBOUNCE_MS) return

  recentlySeen.set(slug, Date.now())

  // Clean up stale entries so the Map doesn't grow unboundedly
  const cutoff = Date.now() - DEBOUNCE_MS * 3
  for (const [k, t] of recentlySeen) {
    if (t < cutoff) recentlySeen.delete(k)
  }

  // Fire-and-forget — errors are handled inside
  void handleSolved(slug)
})

function isSOLVED(msg: unknown): msg is { type: 'SOLVED'; slug: string } {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as Record<string, unknown>)['type'] === 'SOLVED' &&
    typeof (msg as Record<string, unknown>)['slug'] === 'string'
  )
}

// ── Core handler ─────────────────────────────────────────────────────────────

async function handleSolved(slug: string): Promise<void> {
  const stored = await chrome.storage.local.get(['apiBase', 'token', 'enabled'])

  // Default enabled = true; user can disable from the popup
  if (stored['enabled'] === false) return

  const token = stored['token'] as string | undefined
  if (!token) {
    notify('preparena-setup', 'PrepArena: setup needed', 'Open the extension popup and add your API token.')
    return
  }

  const apiBase = ((stored['apiBase'] as string | undefined) ?? DEFAULT_API_BASE).replace(/\/$/, '')

  try {
    const res = await fetch(`${apiBase}/api/progress/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ leetcodeSlug: slug }),
    })

    if (res.ok) {
      notify(`preparena-ok-${slug}`, 'PrepArena ✓', `"${slug}" marked as solved!`)
      return
    }

    if (res.status === 401 || res.status === 403) {
      notify('preparena-auth', 'PrepArena: token rejected', 'Generate a new token in PrepArena → Profile.')
      return
    }

    if (res.status === 404) {
      // Problem slug not mapped in PrepArena — expected and silent
      return
    }

    // Any other non-OK status: silent fail (don't spam the user)
  } catch {
    // Network error — silent (offline, wrong base URL, etc.)
  }
}

// ── Notification helper ───────────────────────────────────────────────────────

function notify(id: string, title: string, message: string): void {
  chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title,
    message,
  })
}
