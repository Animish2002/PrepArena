import { create } from 'zustand'

export interface ChallengeLeaderboardEntry {
  rank: number
  userId: string
  name: string
  username: string
  avatarUrl?: string | null
  problemsSolved: number
  totalProblems: number
  completed: boolean
  totalTimeSeconds: number
  completedAt?: number | null
  isCurrentUser: boolean
}

interface ChallengeStore {
  leaderboard: ChallengeLeaderboardEntry[]
  setLeaderboard: (rows: ChallengeLeaderboardEntry[]) => void
  updateLeaderboardEntry: (entry: {
    userId: string
    name: string
    username: string
    avatarUrl?: string | null
    problemsSolved: number
    totalProblems: number
    totalTimeSeconds: number
  }) => void
}

function resort(rows: ChallengeLeaderboardEntry[]): ChallengeLeaderboardEntry[] {
  return rows
    .slice()
    .sort(
      (a, b) =>
        b.problemsSolved - a.problemsSolved ||
        a.totalTimeSeconds - b.totalTimeSeconds,
    )
    .map((r, i) => ({ ...r, rank: i + 1 }))
}

export const useChallengeStore = create<ChallengeStore>((set) => ({
  leaderboard: [],

  setLeaderboard: (rows) => set({ leaderboard: resort(rows) }),

  updateLeaderboardEntry: (entry) =>
    set((s) => {
      const existing = s.leaderboard.find((r) => r.userId === entry.userId)
      let updated: ChallengeLeaderboardEntry[]
      if (existing) {
        updated = s.leaderboard.map((r) =>
          r.userId === entry.userId
            ? {
                ...r,
                problemsSolved: entry.problemsSolved,
                totalProblems: entry.totalProblems,
                totalTimeSeconds: entry.totalTimeSeconds,
                completed: entry.problemsSolved >= entry.totalProblems,
              }
            : r,
        )
      } else {
        updated = [
          ...s.leaderboard,
          {
            rank: 0,
            userId: entry.userId,
            name: entry.name,
            username: entry.username,
            avatarUrl: entry.avatarUrl ?? null,
            problemsSolved: entry.problemsSolved,
            totalProblems: entry.totalProblems,
            completed: entry.problemsSolved >= entry.totalProblems,
            totalTimeSeconds: entry.totalTimeSeconds,
            completedAt: null,
            isCurrentUser: false,
          },
        ]
      }
      return { leaderboard: resort(updated) }
    }),
}))
