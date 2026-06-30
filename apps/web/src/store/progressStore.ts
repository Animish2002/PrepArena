import { create } from 'zustand'
import api from '../lib/api'

export interface McqContent {
  question: string
  options: string[]
}

export interface Problem {
  id: string
  title: string
  topic: string
  subtopic?: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  platform?: string | null
  platformLink?: string | null
  estimatedMinutes?: number | null
  problemNumber?: number | null
  tags?: string | null
  userStatus?: 'solved' | 'attempted' | null
  userConfidence?: number | null
  isBookmarked?: boolean
  // Subject / type fields
  questionType?: 'coding' | 'sql' | 'theory' | 'mcq' | null
  subject?: string | null
  sheet?: string | null
  // For theory: markdown string; for MCQ: { question, options } object; for coding/sql: null
  content?: string | McqContent | null
}

export interface UserProgress {
  status: 'solved' | 'attempted'
  confidence?: number | null
  attempts?: number
  firstSolvedAt?: number | null
  lastSolvedAt?: number | null
}

export interface TopicStat {
  topic: string
  total: number
  solved: number
  avgConfidence: number | null
}

export interface SubjectStat {
  solved?: number
  total: number
  avg_confidence?: number
  coding_solved?: number
  coding_total?: number
  theory_solved?: number
  theory_total?: number
  mcq_correct_rate?: number
  mcq_total?: number
}

export interface ProgressStats {
  solvedByDifficulty: { difficulty: string | null; solved: number }[]
  totalByDifficulty: { difficulty: string | null; total: number }[]
  topicBreakdown: TopicStat[]
  avgTimeByDifficulty: { difficulty: string | null; avgSeconds: string | null }[]
  confidenceDistribution: { confidence: number | null; count: number }[]
  interviewReadiness: number
  overall_readiness?: number
  subjects?: {
    dsa: SubjectStat
    sql: SubjectStat
    java: SubjectStat
    oops: SubjectStat
    spring: SubjectStat
  }
  xp: { total: number; weekly: number; monthly: number }
}

interface ProgressState {
  problems: Problem[]
  userProgress: Record<string, UserProgress>
  bookmarks: Record<string, boolean>
  stats: ProgressStats | null
  totalProblems: number
  isLoading: boolean
  allLoaded: boolean

  fetchProblems: (filters?: Record<string, string>) => Promise<void>
  fetchAllProblems: () => Promise<void>
  fetchStats: () => Promise<void>
  markSolved: (
    problemId: string,
    data: { confidence: number; duration_seconds: number; started_at: number },
  ) => Promise<{ xp_gained: number; total_xp: number }>
  markAttempted: (problemId: string) => Promise<void>
  toggleBookmark: (problemId: string) => Promise<void>
  updateMcqProgress: (problemId: string, isCorrect: boolean) => void
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  problems: [],
  userProgress: {},
  bookmarks: {},
  stats: null,
  totalProblems: 0,
  isLoading: false,
  allLoaded: false,

  fetchProblems: async (filters = {}) => {
    set({ isLoading: true })
    try {
      const params = new URLSearchParams(filters).toString()
      const { data } = await api.get<{ problems: Problem[]; total: number }>(
        `/api/problems?${params}`,
      )

      const progress: Record<string, UserProgress> = { ...get().userProgress }
      const bmarks: Record<string, boolean> = { ...get().bookmarks }
      for (const p of data.problems) {
        if (p.userStatus) {
          progress[p.id] = { status: p.userStatus as 'solved' | 'attempted', confidence: p.userConfidence }
        }
        if (p.isBookmarked !== undefined) {
          bmarks[p.id] = !!p.isBookmarked
        }
      }

      set({ problems: data.problems, totalProblems: data.total, userProgress: progress, bookmarks: bmarks, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchAllProblems: async () => {
    if (get().allLoaded) return
    set({ isLoading: true })
    try {
      const { data } = await api.get<{ problems: Problem[]; total: number }>(
        '/api/problems?limit=500',
      )

      const progress: Record<string, UserProgress> = {}
      const bmarks: Record<string, boolean> = {}
      for (const p of data.problems) {
        if (p.userStatus) {
          progress[p.id] = { status: p.userStatus as 'solved' | 'attempted', confidence: p.userConfidence }
        }
        bmarks[p.id] = !!p.isBookmarked
      }

      set({
        problems: data.problems,
        totalProblems: data.total,
        userProgress: progress,
        bookmarks: bmarks,
        isLoading: false,
        allLoaded: true,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get<ProgressStats>('/api/progress/stats')
      set({ stats: data })
    } catch {
      // Non-fatal
    }
  },

  markSolved: async (problemId, data) => {
    const res = await api.post<{ xp_gained: number; total_xp: number }>(
      `/api/progress/${problemId}/solve`,
      data,
    )
    set((state) => ({
      userProgress: {
        ...state.userProgress,
        [problemId]: { status: 'solved', confidence: data.confidence },
      },
    }))
    return res.data
  },

  markAttempted: async (problemId) => {
    await api.post(`/api/progress/${problemId}/attempt`)
    set((state) => {
      const existing = state.userProgress[problemId]
      if (existing?.status === 'solved') return {}
      return {
        userProgress: { ...state.userProgress, [problemId]: { status: 'attempted' } },
      }
    })
  },

  toggleBookmark: async (problemId) => {
    const current = get().bookmarks[problemId] ?? false
    set((state) => ({ bookmarks: { ...state.bookmarks, [problemId]: !current } }))
    try {
      if (current) {
        await api.delete(`/api/problems/${problemId}/bookmark`)
      } else {
        await api.post(`/api/problems/${problemId}/bookmark`)
      }
    } catch {
      set((state) => ({ bookmarks: { ...state.bookmarks, [problemId]: current } }))
    }
  },

  updateMcqProgress: (problemId, isCorrect) => {
    set((state) => {
      const existing = state.userProgress[problemId]
      if (isCorrect) {
        return {
          userProgress: {
            ...state.userProgress,
            [problemId]: { status: 'solved', confidence: existing?.confidence ?? 2 },
          },
        }
      }
      if (existing?.status === 'solved') return {}
      return {
        userProgress: {
          ...state.userProgress,
          [problemId]: { status: 'attempted' },
        },
      }
    })
  },
}))
