# PrepArena LeetCode Sync — Browser Extension

Automatically marks a LeetCode problem as solved in PrepArena the moment you get an **Accepted** verdict — no manual sync needed.

---

## How it works

1. When you submit a solution on LeetCode, the extension intercepts the submission-check response (`/submissions/detail/{id}/check/`).
2. If the response is `Accepted`, it reads the problem slug from the URL and sends it to the PrepArena API (`POST /api/progress/complete`) using your personal token.
3. PrepArena marks the matching problem solved immediately.

The extension never reads your LeetCode password, session cookie, or code. It only reads the solved/failed status from LeetCode's own response and the problem slug from the URL.

---

## Install

### Prerequisites

- Chrome or Edge (any recent version with Manifest V3 support)
- Node.js 18+ (for building)

### Build

```bash
cd extension
npm install
npm run build
```

This creates `extension/dist/` — the loadable extension folder.

### Load in Chrome / Edge

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode** (toggle in the top-right)
3. Click **Load unpacked**
4. Select the `extension/dist/` folder

The PrepArena icon appears in your toolbar.

---

## Generate your PrepArena token

The extension authenticates with a personal access token, **not** your PrepArena login.

1. Open [PrepArena → Profile](https://prep-arena.animishchopade.in/profile)
2. Scroll to **Browser Extension**
3. Click **Generate** — copy the token immediately (it's shown only once)

---

## Setup

Click the PrepArena toolbar icon to open the popup:

| Field | Description |
|-------|-------------|
| **API Base URL** | Keep the default unless you're running PrepArena locally |
| **Personal Access Token** | Paste the `pa_…` token from PrepArena |
| **Extension enabled** | Toggle to pause without uninstalling |

Click **Save**, then **Test connection** — you should see `✓ Connected to PrepArena`.

---

## Test it

1. Open any LeetCode problem you haven't solved (or use an easy one).
2. Write a correct solution and submit.
3. When the verdict turns **Accepted**, a browser notification appears:  
   `PrepArena ✓ — "two-sum" marked as solved!`
4. Reload PrepArena — the problem shows a ✓.

---

## Development (watch mode)

```bash
npm run dev
```

Rebuilds on every file change. Reload the extension in `chrome://extensions` after each change (click the refresh icon on the extension card, **not** F5 — that reloads the extensions page, not the extension).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| No notification after Accepted | Open the popup → Test connection. If it says "Token rejected", generate a new token in PrepArena. |
| Notification says "Problem not found" | The problem has no `leetcode_slug` set in PrepArena yet. Use Profile → LeetCode Sync (bulk import) and wait for the problem to be mapped. |
| Nothing happens at all | Check `chrome://extensions` → PrepArena Sync → **Errors**. Also check the background service worker console: Extensions page → PrepArena Sync → **Service Worker** → **Inspect**. |
| Token invalid after a while | PrepArena tokens don't expire but can be revoked. Check Profile → Browser Extension for active tokens. |
| LeetCode changed their API and detection stopped | The interceptor is in `src/inject.ts`. It watches for `state === "SUCCESS"` and `status_msg === "Accepted"` in the REST check endpoint. If LeetCode changes the endpoint URL or response shape, update `isCheckUrl()` and `isAccepted()` in that file and rebuild. |

---

## Known limitation

Username-based sync (Profile → LeetCode Sync) can only import your **~50 most recent** accepted submissions because LeetCode's public API doesn't return full history without authentication. The extension has **no such limit** — it fires in real time from your authenticated browser session and covers every accepted submission going forward.

---

## Privacy

- The extension only reads **solved/failed status** from LeetCode's submission-check response and the **problem slug** from the page URL.
- It stores only: the PrepArena API base URL, your PrepArena personal token (hashed on the server, stored plaintext only in `chrome.storage.local` on your device), and an enabled/disabled flag.
- It sends only `{ leetcodeSlug }` to your PrepArena account. No LeetCode credentials, code, or personal data ever leave your browser.
- The extension never communicates with any third-party server other than LeetCode (to read submissions) and your PrepArena API.

This privacy note is required for Chrome Web Store submission.
