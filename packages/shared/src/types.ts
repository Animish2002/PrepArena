export interface User {
  id: string
  username: string
  email: string
  avatarUrl?: string
  rating: number
  createdAt: string
  updatedAt: string
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
