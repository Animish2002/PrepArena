import { create } from 'zustand'

export interface FeedEvent {
  id: string
  type: string
  payload: string | null
  createdAt: number | null
  userId: string
  username: string
  name: string
  avatarUrl?: string | null
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'battle'
}

interface FeedStore {
  events: FeedEvent[]
  toasts: Toast[]
  pushEvent: (event: FeedEvent) => void
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useFeedStore = create<FeedStore>((set) => ({
  events: [],
  toasts: [],
  pushEvent: (event) =>
    set((s) => ({
      events: [event, ...s.events].slice(0, 50),
    })),
  addToast: (message, type) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
