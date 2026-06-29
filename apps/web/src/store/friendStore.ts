import { create } from 'zustand'

export interface PendingRequest {
  friendshipId: string
  from: {
    id: string
    name: string
    username: string
    avatarUrl?: string | null
    problemsSolved: number
  }
  sentAt: number
}

interface FriendStore {
  pendingRequests: PendingRequest[]
  pendingCount: number
  isLoaded: boolean
  setPendingRequests: (requests: PendingRequest[]) => void
  addPendingRequest: (req: PendingRequest) => void
  removePendingRequest: (friendshipId: string) => void
}

export const useFriendStore = create<FriendStore>((set) => ({
  pendingRequests: [],
  pendingCount: 0,
  isLoaded: false,

  setPendingRequests: (requests) =>
    set({ pendingRequests: requests, pendingCount: requests.length, isLoaded: true }),

  addPendingRequest: (req) =>
    set((s) => ({
      pendingRequests: s.pendingRequests.some((r) => r.friendshipId === req.friendshipId)
        ? s.pendingRequests
        : [req, ...s.pendingRequests],
      pendingCount: s.pendingRequests.some((r) => r.friendshipId === req.friendshipId)
        ? s.pendingCount
        : s.pendingCount + 1,
    })),

  removePendingRequest: (friendshipId) =>
    set((s) => ({
      pendingRequests: s.pendingRequests.filter((r) => r.friendshipId !== friendshipId),
      pendingCount: Math.max(0, s.pendingCount - 1),
    })),
}))
