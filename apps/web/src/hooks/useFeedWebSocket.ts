import { useCallback, useEffect, useRef } from 'react'
import { useFeedStore, type FeedEvent } from '../store/feedStore'

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
  const pushEvent = useFeedStore((s) => s.pushEvent)
  const addToast = useFeedStore((s) => s.addToast)

  const wsRef = useRef<WebSocket | null>(null)
  const attemptRef = useRef(0)
  const unmountedRef = useRef(false)
  const pingRef = useRef<ReturnType<typeof setInterval>>()

  const connect = useCallback(() => {
    if (unmountedRef.current) return

    const apiUrl = (import.meta.env.VITE_API_URL as string)
      .replace('https://', 'wss://')
      .replace('http://', 'ws://')

    const ws = new WebSocket(`${apiUrl}/api/feed/ws`)
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
      if (data.type === 'pong' || !data.id) return

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
  }, [pushEvent, addToast])

  useEffect(() => {
    connect()
    return () => {
      unmountedRef.current = true
      clearInterval(pingRef.current)
      wsRef.current?.close(1000, 'unmount')
    }
  }, [connect])
}
