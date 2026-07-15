// LeetCode GraphQL client — username-only (no session cookie).
//
// KNOWN LIMITATION: recentAcSubmissionList is the only public query that
// returns per-user AC data without an authenticated session. LeetCode caps
// the returned history (typically ~50 recent submissions for unauthenticated
// callers). The browser extension bypasses this by running inside the user's
// authenticated LeetCode session and calling POST /api/progress/complete for
// each solve in real time, giving full history coverage.

const GQL = 'https://leetcode.com/graphql'

export type SlugsResult =
  | { ok: true; slugs: string[] }
  | { ok: false; error: 'not_found' | 'private' | 'rate_limited' | 'network' }

const RECENT_AC_QUERY = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) { titleSlug }
  }
`

const PROFILE_QUERY = `
  query matchedUser($username: String!) {
    matchedUser(username: $username) { username }
  }
`

async function gqlPost<T>(query: string, variables: Record<string, unknown>): Promise<{ body: T; status: number }> {
  const res = await fetch(GQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com',
    },
    body: JSON.stringify({ query, variables }),
  })
  const body = (await res.json()) as T
  return { body, status: res.status }
}

export async function validateLeetCodeUsername(username: string): Promise<boolean> {
  try {
    const { body, status } = await gqlPost<{ data?: { matchedUser?: { username: string } | null } }>(
      PROFILE_QUERY,
      { username },
    )
    if (status !== 200) return false
    return body?.data?.matchedUser != null
  } catch {
    return false
  }
}

export async function fetchSolvedSlugs(username: string): Promise<SlugsResult> {
  try {
    const { body, status } = await gqlPost<{
      data?: { recentAcSubmissionList?: Array<{ titleSlug: string }> | null }
    }>(RECENT_AC_QUERY, { username, limit: 1000 })

    if (status === 429) return { ok: false, error: 'rate_limited' }
    if (status !== 200) return { ok: false, error: 'network' }

    const list = body?.data?.recentAcSubmissionList
    if (list === null) return { ok: false, error: 'private' }
    if (!Array.isArray(list)) return { ok: false, error: 'not_found' }

    const slugs = [...new Set(list.map((s) => s.titleSlug))]
    return { ok: true, slugs }
  } catch {
    return { ok: false, error: 'network' }
  }
}
