/**
 * popup.ts — popup page script.
 *
 * Persists token, API base URL, and enabled flag to chrome.storage.local.
 * The token is never logged or displayed after initial paste (field uses
 * type="password"). The only time the plaintext is visible is when the
 * user pastes it — then they can dismiss the popup.
 */

const DEFAULT_API_BASE = 'https://prep-arena.animishchopade.in'

function $<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

function setStatus(msg: string, cls: '' | 'ok' | 'error' = ''): void {
  const el = $('status')
  el.textContent = msg
  el.className = cls
}

async function loadSettings(): Promise<void> {
  const data = await chrome.storage.local.get(['apiBase', 'token', 'enabled'])

  const apiBase = (data['apiBase'] as string | undefined) ?? DEFAULT_API_BASE
  const token = (data['token'] as string | undefined) ?? ''
  const enabled = (data['enabled'] as boolean | undefined) ?? true

  $<HTMLInputElement>('apiBase').value = apiBase
  // Show a placeholder bullet string when a token is stored, not the real value
  if (token) $<HTMLInputElement>('token').placeholder = '••••••••  (token saved — paste to replace)'
  $<HTMLInputElement>('enabled').checked = enabled
}

async function saveSettings(): Promise<void> {
  const apiBase = $<HTMLInputElement>('apiBase').value.trim().replace(/\/$/, '') || DEFAULT_API_BASE
  const enabled = $<HTMLInputElement>('enabled').checked
  const tokenInput = $<HTMLInputElement>('token').value.trim()

  const toSave: Record<string, unknown> = { apiBase, enabled }

  // Only overwrite the stored token when the user actually typed/pasted one
  if (tokenInput.length > 0) {
    toSave['token'] = tokenInput
  }

  await chrome.storage.local.set(toSave)
}

async function testConnection(): Promise<void> {
  setStatus('Testing…')
  $<HTMLButtonElement>('test').disabled = true

  await saveSettings()

  const data = await chrome.storage.local.get(['apiBase', 'token'])
  const token = data['token'] as string | undefined
  const apiBase = ((data['apiBase'] as string | undefined) ?? DEFAULT_API_BASE).replace(/\/$/, '')

  if (!token) {
    setStatus('No token saved — paste your PrepArena token and save first.', 'error')
    $<HTMLButtonElement>('test').disabled = false
    return
  }

  try {
    const res = await fetch(`${apiBase}/api/leetcode/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) {
      const body = (await res.json()) as { leetcodeUsername?: string | null }
      const linked = body.leetcodeUsername ? ` · LeetCode: @${body.leetcodeUsername}` : ''
      setStatus(`✓ Connected to PrepArena${linked}`, 'ok')
    } else if (res.status === 401 || res.status === 403) {
      setStatus('✗ Token rejected — generate a new one in PrepArena → Profile.', 'error')
    } else {
      setStatus(`✗ Server error (HTTP ${res.status})`, 'error')
    }
  } catch {
    setStatus('✗ Network error — check the API base URL.', 'error')
  }

  $<HTMLButtonElement>('test').disabled = false
}

// ── Wire up ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  void loadSettings()

  $<HTMLButtonElement>('save').addEventListener('click', async () => {
    await saveSettings()
    setStatus('Saved ✓', 'ok')
    setTimeout(() => setStatus(''), 1500)
  })

  $<HTMLButtonElement>('test').addEventListener('click', () => void testConnection())

  // Auto-save on enabled toggle change
  $<HTMLInputElement>('enabled').addEventListener('change', () => void saveSettings())
})
