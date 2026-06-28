import { create } from 'zustand'
import api from '../lib/api'

export interface User {
  id: string
  email: string
  name: string
  username: string
  avatarUrl?: string | null
  createdAt?: number
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Clear local state even if the request fails
    }
    localStorage.removeItem('preParena_token')
    set({ user: null, isAuthenticated: false })
    window.location.href = '/login'
  },

  fetchMe: async () => {
    try {
      set({ isLoading: true })
      const { data } = await api.get<{ user: User }>('/auth/me')
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
