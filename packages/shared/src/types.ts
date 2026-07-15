export interface User {
  id: string
  username: string
  email: string
  avatarUrl?: string
  rating: number
  createdAt: string
  updatedAt: string
}

export type QuestionType = 'coding' | 'sql' | 'theory' | 'mcq'

export type Subject = 'dsa' | 'sql' | 'java' | 'oops' | 'spring-boot' | 'system-design'

export interface McqContent {
  question: string
  options: string[]
  correct_index: number
  explanation: string
}

export interface Problem {
  id: string
  title: string
  slug: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  description: string
  examples: Array<{
    input: string
    output: string
    explanation?: string
  }>
  constraints: string[]
  createdAt: string
  question_type: QuestionType
  subject: Subject
  // theory: Markdown string; mcq: McqContent; coding/sql: null
  content?: string | McqContent | null
  content_source?: string | null
}

export interface McqAttempt {
  id: string
  userId: string
  problemId: string
  selectedIndex: number
  isCorrect: boolean
  attemptedAt: string
}

export interface UserProgress {
  id: string
  userId: string
  problemId: string
  status: 'unseen' | 'attempted' | 'solved'
  solvedAt?: string
  attempts: number
}

export interface SolveSession {
  id: string
  userId: string
  problemId: string
  language: string
  code: string
  verdict: 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'compile_error'
  runtime?: number
  memory?: number
  createdAt: string
}

export interface Friendship {
  id: string
  requesterId: string
  addresseeId: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface Group {
  id: string
  name: string
  description?: string
  ownerId: string
  memberIds: string[]
  createdAt: string
}

export interface Battle {
  id: string
  groupId?: string
  participantIds: string[]
  problemIds: string[]
  status: 'waiting' | 'active' | 'finished'
  startedAt?: string
  endedAt?: string
  winnerId?: string
  createdAt: string
}

// ─── LeetCode Sync ────────────────────────────────────────────────────────────

export interface LeetCodeStatusResponse {
  leetcodeUsername: string | null
  leetcodeLastSyncedAt: number | null
}

export interface LeetCodeLinkRequest {
  username: string
}

export interface LeetCodeLinkResponse {
  leetcodeUsername: string
}

export interface LeetCodeSyncResponse {
  matched: number
  newlyCompleted: number
}

export interface ProgressCompleteRequest {
  leetcodeSlug: string
}

export interface ProgressCompleteResponse {
  success: boolean
  problemId: string
  title: string
}

// ─── Personal Access Tokens ───────────────────────────────────────────────────

export interface ApiToken {
  id: string
  label: string
  createdAt: number | null
  lastUsedAt: number | null
}

export interface CreateTokenRequest {
  label?: string
}

export interface CreateTokenResponse {
  token: string
  label: string
  id: string
}

export interface ListTokensResponse {
  tokens: ApiToken[]
}
