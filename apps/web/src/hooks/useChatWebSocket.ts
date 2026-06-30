import { useCallback, useEffect, useRef, useState } from 'react'
import { useChatStore, type ChatMessage } from '../store/chatStore'
import api from '../lib/api'

const BACKOFF = [500, 1000, 2000, 4000, 8000, 16000, 30000]

export function useChatWebSocket(conversationId: string | null) {
  const { addMessage, setMessages, prependMessages, setTyping, addReaction, markMessageRead, markRead } =
    useChatStore()

  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTypingLocal] = useState(false)
  const [hasOlderMessages, setHasOlderMessages] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const attemptRef = useRef(0)
  const unmountedRef = useRef(false)
  const convIdRef = useRef(conversationId)
  const loadedIds = useRef(new Set<string>())
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pingRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  convIdRef.current = conversationId

  const loadHistory = useCallback(
    async (convId: string, beforeId?: string) => {
      if (loadingHistory) return
      setLoadingHistory(true)
      try {
        const params = beforeId ? `?before=${beforeId}&limit=40` : '?limit=40'
        const res = await api.get<{ messages: ChatMessage[] }>(
          `/api/chat/conversations/${convId}/messages${params}`,
        )
        const msgs = res.data.messages
        if (msgs.length < 40) setHasOlderMessages(false)
        msgs.forEach((m) => loadedIds.current.add(m.id))
        if (beforeId) {
          prependMessages(convId, msgs)
        } else {
          setMessages(convId, msgs)
          markRead(convId)
        }
      } catch {
        setHasOlderMessages(false)
      } finally {
        setLoadingHistory(false)
      }
    },
    [loadingHistory, prependMessages, setMessages, markRead],
  )

  const connect = useCallback(() => {
    const convId = convIdRef.current
    if (!convId || unmountedRef.current) return

    const apiUrl = (import.meta.env.VITE_API_URL as string)
      .replace('https://', 'wss://')
      .replace('http://', 'ws://')

    const token = localStorage.getItem('preParena_token') ?? ''
    const ws = new WebSocket(`${apiUrl}/api/chat/conversations/${convId}/ws?token=${encodeURIComponent(token)}`)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      attemptRef.current = 0
      clearInterval(pingRef.current)
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, 25_000)
    }

    ws.onmessage = (e: MessageEvent) => {
      let data: Record<string, unknown>
      try {
        data = JSON.parse(e.data as string) as Record<string, unknown>
      } catch {
        return
      }

      if (data.type === 'pong') return

      if (data.type === 'message') {
        const msg = data.message as ChatMessage
        if (!loadedIds.current.has(msg.id)) {
          loadedIds.current.add(msg.id)
          addMessage(convId, msg)
        }
      }

      if (data.type === 'typing') {
        const isTypingNow = Boolean(data.is_typing)
        setIsTypingLocal(isTypingNow)
        if (isTypingNow) {
          clearTimeout(typingTimerRef.current)
          typingTimerRef.current = setTimeout(() => setIsTypingLocal(false), 4000)
        }
        setTyping(convId, isTypingNow)
      }

      if (data.type === 'read') {
        markMessageRead(convId, data.message_id as string, data.read_at as number)
      }

      if (data.type === 'reaction') {
        addReaction(convId, data.message_id as string, data.user_id as string, data.emoji as string)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      clearInterval(pingRef.current)
      if (unmountedRef.current) return
      const delay = BACKOFF[Math.min(attemptRef.current, BACKOFF.length - 1)]
      attemptRef.current++
      setTimeout(connect, delay)
    }

    ws.onerror = () => ws.close()
  }, [addMessage, setTyping, addReaction, markMessageRead])

  useEffect(() => {
    unmountedRef.current = false
    loadedIds.current = new Set()
    setHasOlderMessages(true)

    if (!conversationId) return

    void loadHistory(conversationId)
    connect()

    return () => {
      unmountedRef.current = true
      clearInterval(pingRef.current)
      clearTimeout(typingTimerRef.current)
      wsRef.current?.close(1000, 'unmount')
      setIsConnected(false)
      setIsTypingLocal(false)
    }
  }, [conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    (content: string, msgType = 'text', metadata?: unknown) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
      wsRef.current.send(
        JSON.stringify({ type: 'message', content, msg_type: msgType, metadata }),
      )
    },
    [],
  )

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: isTyping }))
  }, [])

  const sendRead = useCallback((messageId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'read', message_id: messageId }))
  }, [])

  const sendReaction = useCallback((messageId: string, emoji: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'react', message_id: messageId, emoji }))
  }, [])

  const loadOlderMessages = useCallback(() => {
    if (!conversationId || !hasOlderMessages || loadingHistory) return
    const msgs = useChatStore.getState().messages[conversationId] ?? []
    const oldest = msgs[0]
    if (oldest) {
      void loadHistory(conversationId, oldest.id)
    }
  }, [conversationId, hasOlderMessages, loadingHistory, loadHistory])

  return {
    isConnected,
    isTyping,
    hasOlderMessages,
    loadingHistory,
    sendMessage,
    sendTyping,
    sendRead,
    sendReaction,
    loadOlderMessages,
  }
}
