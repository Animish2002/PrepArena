/**
 * content.ts — runs in the ISOLATED CONTENT SCRIPT world.
 *
 * 1. Injects inject.js into the real page context so it can patch
 *    window.fetch / XHR before LeetCode's own JS runs.
 * 2. Bridges postMessage events from the page to the background worker.
 * 3. Handles SPA navigation: because LeetCode is a Next.js SPA, URLs
 *    change without full page reloads. The inject.js patches are global
 *    and persist across SPA navigations automatically. A MutationObserver
 *    watches for body replacement as an extra safety net.
 */

// ── 1. Inject the page script ────────────────────────────────────────────────

function injectPageScript(): void {
  const existing = document.getElementById('preparena-inject')
  if (existing) return // already injected (shouldn't happen, but guard anyway)

  const script = document.createElement('script')
  script.id = 'preparena-inject'
  script.src = chrome.runtime.getURL('inject.js')
  script.type = 'text/javascript'

  // Remove the element after it executes to keep the DOM clean
  script.addEventListener('load', () => script.remove())
  script.addEventListener('error', () => script.remove())

  // Prepend to <head> (or <html> if head isn't available yet at document_start)
  ;(document.head ?? document.documentElement).prepend(script)
}

injectPageScript()

// ── 2. Bridge: page → background ────────────────────────────────────────────

window.addEventListener('message', (event: MessageEvent) => {
  // Only accept messages from our own inject script (same window, same origin)
  if (event.source !== window) return

  const data = event.data as { source?: string; type?: string; slug?: string }
  if (data?.source !== 'preparena-ext') return
  if (data.type === 'SOLVED' && typeof data.slug === 'string' && data.slug.length > 0) {
    chrome.runtime.sendMessage({ type: 'SOLVED', slug: data.slug }).catch(() => {
      // Background service worker may have been terminated — that's fine,
      // the message is best-effort and the next wake-up will handle it.
    })
  }
})

// ── 3. SPA navigation guard ──────────────────────────────────────────────────
// LeetCode is a Next.js SPA: clicking between problems changes the URL via
// history.pushState without a full page reload, so our inject.js only runs
// once per tab load. That's sufficient — the fetch/XHR patches are global
// and persist for the entire lifetime of the page.
//
// We still watch for document.body replacement (defensive for edge cases
// where the SPA framework might swap out the entire body node).

let injectedForBody = document.body

new MutationObserver(() => {
  if (document.body && document.body !== injectedForBody) {
    injectedForBody = document.body
    // Patches are global — no re-injection needed. This is just a guard.
  }
}).observe(document.documentElement, { childList: true })
