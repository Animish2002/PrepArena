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

export interface ToastAction {
  label: string
  variant: 'primary' | 'danger'
  onClick: () => void
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'battle' | 'friend_request'
  persistent?: boolean
  actions?: ToastAction[]
}

interface FeedStore {
  events: FeedEvent[]
  toasts: Toast[]
  pushEvent: (event: FeedEvent) => void
  addToast: (
    message: string,
    type: Toast['type'],
    options?: { persistent?: boolean; actions?: ToastAction[] },
  ) => void
  removeToast: (id: string) => void
}

export const useFeedStore = create<FeedStore>((set) => ({
  events: [],
  toasts: [],

  pushEvent: (event) =>
    set((s) => ({
      events: [event, ...s.events].slice(0, 50),
    })),

  addToast: (message, type, options) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, type, ...options }] }))
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
