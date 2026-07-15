/**
 * inject.ts — runs in the REAL PAGE CONTEXT (injected via <script> tag).
 *
 * Patches window.fetch and XMLHttpRequest to intercept LeetCode's
 * submission-check responses. When an "Accepted" result is detected,
 * posts a message to the content script via window.postMessage.
 *
 * Defensive by design: every property access is guarded. A bug here
 * must never throw into LeetCode's own error handlers.
 */
;(function preparenaInject() {
  'use strict'

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function getSlug(): string | null {
    try {
      const parts = location.pathname.split('/').filter(Boolean)
      // /problems/<slug>/  or  /problems/<slug>/description/  etc.
      if (parts[0] === 'problems' && typeof parts[1] === 'string' && parts[1].length > 0) {
        return parts[1]
      }
    } catch {}
    return null
  }

  function isCheckUrl(url: string): boolean {
    return url.includes('/submissions/detail/') && url.includes('/check/')
  }

  function isAccepted(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false
    const d = data as Record<string, unknown>
    // REST check endpoint: { state: "SUCCESS", status_msg: "Accepted" }
    // Some LeetCode versions also use status_code: 10 (Accepted)
    const stateOk = d['state'] === 'SUCCESS'
    const msgOk = d['status_msg'] === 'Accepted'
    const codeOk = d['status_code'] === 10
    return stateOk && (msgOk || codeOk)
  }

  function notifySolved(slug: string): void {
    window.postMessage({ source: 'preparena-ext', type: 'SOLVED', slug }, '*')
  }

  function handleCheckResponse(data: unknown): void {
    try {
      if (isAccepted(data)) {
        const slug = getSlug()
        if (slug) notifySolved(slug)
      }
    } catch {}
  }

  // ── Patch window.fetch ───────────────────────────────────────────────────────

  const originalFetch = window.fetch.bind(window)

  window.fetch = async function (...args: Parameters<typeof originalFetch>): Promise<Response> {
    const response = await originalFetch(...args)
    try {
      let url = ''
      if (typeof args[0] === 'string') {
        url = args[0]
      } else if (args[0] instanceof URL) {
        url = args[0].href
      } else if (args[0] instanceof Request) {
        url = args[0].url
      }

      if (isCheckUrl(url)) {
        // Clone so we don't consume the response body the page needs
        response
          .clone()
          .json()
          .then((data: unknown) => handleCheckResponse(data))
          .catch(() => {})
      }
    } catch {}
    return response
  }

  // ── Patch XMLHttpRequest ─────────────────────────────────────────────────────

  interface XHRWithMeta extends XMLHttpRequest {
    _pa_url?: string
  }

  const OrigOpen = XMLHttpRequest.prototype.open
  const OrigSend = XMLHttpRequest.prototype.send

  // open() is overloaded — accept the broadest signature and pass through
  XMLHttpRequest.prototype.open = function (
    this: XHRWithMeta,
    method: string,
    url: string | URL,
    async = true,
    username?: string | null,
    password?: string | null,
  ): void {
    try {
      this._pa_url = typeof url === 'string' ? url : url.href
    } catch {}
    // @ts-expect-error — TS dislikes spreading into an overloaded signature
    return OrigOpen.call(this, method, url, async, username, password)
  }

  XMLHttpRequest.prototype.send = function (
    this: XHRWithMeta,
    body?: Document | XMLHttpRequestBodyInit | null,
  ): void {
    try {
      if (isCheckUrl(this._pa_url ?? '')) {
        this.addEventListener('load', () => {
          try {
            if (this.status === 200) {
              const data = JSON.parse(this.responseText) as unknown
              handleCheckResponse(data)
            }
          } catch {}
        })
      }
    } catch {}
    return OrigSend.call(this, body)
  }
})()
