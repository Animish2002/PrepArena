import { useCallback, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useFeedStore, type FeedEvent } from '../store/feedStore'
import { useFriendStore } from '../store/friendStore'
import { useChallengeStore } from '../store/challengeStore'
import { useChatStore } from '../store/chatStore'
import api from '../lib/api'

const BACKOFF = [2000, 4000, 8000, 16_000, 30_000]

function tryParse(s?: string | null): Record<string, string> {
  try {
    return JSON.parse(s ?? '{}') as Record<string, string>
  } catch {
    return {}
  }
}

function toastMessage(event: FeedEvent): { msg: string; type: 'success' | 'info' | 'battle' } {
  const username = event.username ?? event.name ?? 'Someone'
  const payload = tryParse(event.payload)
  switch (event.type) {
    case 'solved':
      return { msg: `🔥 ${username} solved "${payload.problem_title ?? 'a problem'}"`, type: 'success' }
    case 'battle_challenged':
    case 'battle_received':
      return { msg: `⚔️ ${username} challenged you to a battle`, type: 'battle' }
    case 'battle_won':
      return { msg: `🏆 ${username} won a battle`, type: 'info' }
    default:
      return { msg: `${username} was active`, type: 'info' }
  }
}

export function useFeedWebSocket() {
  const { pathname } = useLocation()
  const pushEvent = useFeedStore((s) => s.pushEvent)
  const addToast = useFeedStore((s) => s.addToast)
  const addPendingRequest = useFriendStore((s) => s.addPendingRequest)
  const removePendingRequest = useFriendStore((s) => s.removePendingRequest)
  const updateLeaderboardEntry = useChallengeStore((s) => s.updateLeaderboardEntry)
  const { activeConversationId, incrementUnread, fetchConversations } = useChatStore()

  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname
  const activeConvRef = useRef(activeConversationId)
  activeConvRef.current = activeConversationId

  const wsRef = useRef<WebSocket | null>(null)
  const attemptRef = useRef(0)
  const unmountedRef = useRef(false)
  const pingRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const connect = useCallback(() => {
    if (unmountedRef.current) return

    const apiUrl = (import.meta.env.VITE_API_URL as string)
      .replace('https://', 'wss://')
      .replace('http://', 'ws://')

    const token = localStorage.getItem('preParena_token') ?? ''
    const ws = new WebSocket(`${apiUrl}/api/feed/ws?token=${encodeURIComponent(token)}`)
    wsRef.current = ws

    ws.onopen = () => {
      attemptRef.current = 0
      clearInterval(pingRef.current)
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30_000)
    }

    ws.onmessage = (e: MessageEvent) => {
      let msg: unknown
      try {
        msg = JSON.parse(e.data as string)
      } catch {
        return
      }

      const data = msg as Record<string, unknown>
      if (data.type === 'pong') return

      // ── Friend request ────────────────────────────────────────────────────
      if (data.type === 'friend_request') {
        const req = data as {
          friendshipId: string
          from: { id: string; name: string; username: string; avatarUrl?: string | null }
        }

        addPendingRequest({
          friendshipId: req.friendshipId,
          from: { ...req.from, problemsSolved: 0 },
          sentAt: Date.now(),
        })

        addToast(
          `${req.from.name} (@${req.from.username}) sent you a friend request`,
          'friend_request',
          {
            persistent: true,
            actions: [
              {
                label: '✓ Accept',
                variant: 'primary',
                onClick: () => {
                  api
                    .post(`/api/friends/accept/${req.friendshipId}`)
                    .then(() => removePendingRequest(req.friendshipId))
                    .catch(() => {})
                },
              },
              {
                label: '✗ Decline',
                variant: 'danger',
                onClick: () => {
                  api
                    .post(`/api/friends/decline/${req.friendshipId}`)
                    .then(() => removePendingRequest(req.friendshipId))
                    .catch(() => {})
                },
              },
            ],
          },
        )
        return
      }

      // ── Challenge completed ───────────────────────────────────────────────
      if (data.type === 'challenge_completed') {
        const ev = data as {
          name: string
          username: string
          challengeTitle: string
          badgeName: string
        }
        addToast(
          `🏆 ${ev.name} (@${ev.username}) completed "${ev.challengeTitle}" and earned ${ev.badgeName}!`,
          'success',
        )
        return
      }

      // ── New chat message ──────────────────────────────────────────────────
      if (data.type === 'new_message') {
        const ev = data as {
          from_user_id: string
          from_username: string
          preview: string
          conversation_id: string
        }
        const isOnChat = pathnameRef.current === '/chat'
        const isActiveConv = activeConvRef.current === ev.conversation_id
        if (!isOnChat || !isActiveConv) {
          incrementUnread(ev.conversation_id)
          addToast(`💬 ${ev.from_username}: ${ev.preview}`, 'info')
          void fetchConversations()
        }
        return
      }

      // ── Challenge progress (silent leaderboard update) ───────────────────
      if (data.type === 'challenge_progress') {
        const ev = data as {
          userId: string
          name: string
          username: string
          avatarUrl?: string | null
          problemsSolved: number
          totalProblems: number
          totalTimeSeconds: number
        }
        updateLeaderboardEntry(ev)
        return
      }

      // ── Regular feed event ────────────────────────────────────────────────
      if (!data.id) return

      const event = msg as FeedEvent
      pushEvent(event)

      const { msg: text, type } = toastMessage(event)
      addToast(text, type)
    }

    ws.onclose = () => {
      clearInterval(pingRef.current)
      if (unmountedRef.current) return
      const delay = BACKOFF[Math.min(attemptRef.current, BACKOFF.length - 1)]
      attemptRef.current++
      setTimeout(connect, delay)
    }

    ws.onerror = () => ws.close()
  }, [pushEvent, addToast, addPendingRequest, removePendingRequest, updateLeaderboardEntry, incrementUnread, fetchConversations])

  useEffect(() => {
    connect()
    return () => {
      unmountedRef.current = true
      clearInterval(pingRef.current)
      wsRef.current?.close(1000, 'unmount')
    }
  }, [connect])
}
