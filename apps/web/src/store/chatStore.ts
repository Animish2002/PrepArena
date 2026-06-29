import { create } from 'zustand'
import api from '../lib/api'

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: 'text' | 'problem_share' | 'challenge_invite' | 'battle_invite'
  metadata: {
    problem_id?: string
    problem_title?: string
    difficulty?: string
    topic?: string
    platform_link?: string
    challenge_id?: string
    challenge_title?: string
    xp_reward?: number
    battle_id?: string
  } | null
  sent_at: number
  read_at?: number | null
  reactions: Array<{ emoji: string; userId: string }>
}

export interface Conversation {
  id: string
  other_user: { id: string; name: string; username: string; avatarUrl?: string | null }
  last_message_preview: string | null
  last_message_at: number | null
  unread_count: number
}

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, ChatMessage[]>
  unreadCounts: Record<string, number>
  totalUnread: number
  typingUsers: Record<string, boolean>
  conversationsLoaded: boolean

  setActiveConversation: (id: string | null) => void
  setConversations: (convs: Conversation[]) => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  prependMessages: (conversationId: string, msgs: ChatMessage[]) => void
  setMessages: (conversationId: string, msgs: ChatMessage[]) => void
  markRead: (conversationId: string) => void
  setTyping: (conversationId: string, isTyping: boolean) => void
  addReaction: (conversationId: string, messageId: string, userId: string, emoji: string) => void
  markMessageRead: (conversationId: string, messageId: string, readAt: number) => void
  fetchConversations: () => Promise<void>
  incrementUnread: (conversationId: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  unreadCounts: {},
  totalUnread: 0,
  typingUsers: {},
  conversationsLoaded: false,

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setConversations: (convs) => {
    const unreadCounts: Record<string, number> = {}
    let total = 0
    for (const c of convs) {
      unreadCounts[c.id] = c.unread_count
      total += c.unread_count
    }
    set({ conversations: convs, unreadCounts, totalUnread: total, conversationsLoaded: true })
  },

  addMessage: (conversationId, message) => {
    set((s) => {
      const existing = s.messages[conversationId] ?? []
      const deduped = existing.some((m) => m.id === message.id)
        ? existing
        : [...existing, message]

      const updatedConvs = s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              last_message_preview: message.content.slice(0, 60),
              last_message_at: message.sent_at,
            }
          : c,
      )
      // Move to top
      const idx = updatedConvs.findIndex((c) => c.id === conversationId)
      if (idx > 0) {
        const [conv] = updatedConvs.splice(idx, 1)
        updatedConvs.unshift(conv)
      }

      // Only increment unread if sender != me AND not the active conversation
      const isActive = s.activeConversationId === conversationId
      const isOwn = false // caller must handle own messages separately
      const unreadDelta = !isActive && !isOwn ? 1 : 0
      const newCount = (s.unreadCounts[conversationId] ?? 0) + unreadDelta

      return {
        messages: { ...s.messages, [conversationId]: deduped },
        conversations: updatedConvs,
        unreadCounts: { ...s.unreadCounts, [conversationId]: newCount },
        totalUnread: Math.max(0, s.totalUnread + unreadDelta),
      }
    })
  },

  prependMessages: (conversationId, msgs) => {
    set((s) => {
      const existing = s.messages[conversationId] ?? []
      const existingIds = new Set(existing.map((m) => m.id))
      const newMsgs = msgs.filter((m) => !existingIds.has(m.id))
      return {
        messages: { ...s.messages, [conversationId]: [...newMsgs, ...existing] },
      }
    })
  },

  setMessages: (conversationId, msgs) => {
    set((s) => ({ messages: { ...s.messages, [conversationId]: msgs } }))
  },

  markRead: (conversationId) => {
    set((s) => {
      const was = s.unreadCounts[conversationId] ?? 0
      const updatedConvs = s.conversations.map((c) =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c,
      )
      return {
        unreadCounts: { ...s.unreadCounts, [conversationId]: 0 },
        totalUnread: Math.max(0, s.totalUnread - was),
        conversations: updatedConvs,
      }
    })
  },

  setTyping: (conversationId, isTyping) => {
    set((s) => ({ typingUsers: { ...s.typingUsers, [conversationId]: isTyping } }))
  },

  addReaction: (conversationId, messageId, userId, emoji) => {
    set((s) => {
      const msgs = s.messages[conversationId] ?? []
      const updated = msgs.map((m) => {
        if (m.id !== messageId) return m
        const others = m.reactions.filter((r) => r.userId !== userId)
        return { ...m, reactions: [...others, { emoji, userId }] }
      })
      return { messages: { ...s.messages, [conversationId]: updated } }
    })
  },

  markMessageRead: (conversationId, messageId, readAt) => {
    set((s) => {
      const msgs = s.messages[conversationId] ?? []
      const updated = msgs.map((m) =>
        m.id === messageId ? { ...m, read_at: readAt } : m,
      )
      return { messages: { ...s.messages, [conversationId]: updated } }
    })
  },

  fetchConversations: async () => {
    try {
      const res = await api.get<{ conversations: Conversation[] }>('/api/chat/conversations')
      get().setConversations(res.data.conversations)
    } catch {}
  },

  incrementUnread: (conversationId) => {
    set((s) => {
      const newCount = (s.unreadCounts[conversationId] ?? 0) + 1
      const updatedConvs = s.conversations.map((c) =>
        c.id === conversationId ? { ...c, unread_count: newCount } : c,
      )
      return {
        unreadCounts: { ...s.unreadCounts, [conversationId]: newCount },
        totalUnread: s.totalUnread + 1,
        conversations: updatedConvs,
      }
    })
  },
}))
