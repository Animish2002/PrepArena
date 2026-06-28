import { useCallback, useEffect, useRef, useState } from 'react'

type BattleWSStatus = 'connecting' | 'active' | 'completed'

interface SolveRecord {
  userId: string
  problemIndex: number
}

export interface BattleWSState {
  scores: Record<string, number>
  solves: SolveRecord[]
  battleStatus: BattleWSStatus
  winnerId: string | null
}

type WSMessage =
  | { type: 'state'; scores: Record<string, number>; status: string }
  | { type: 'score_update'; scores: Record<string, number>; solver_id: string; problem_index: number }
  | { type: 'battle_result'; winner_id: string | null; scores: Record<string, number> }
  | { type: 'pong' }

const BACKOFF = [1000, 2000, 4000, 8000, 16_000]

export function useBattleWebSocket(battleId: string) {
  const [wsState, setWsState] = useState<BattleWSState>({
    scores: {},
    solves: [],
    battleStatus: 'connecting',
    winnerId: null,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const attemptRef = useRef(0)
  const unmountedRef = useRef(false)
  const pingRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const connect = useCallback(() => {
    if (unmountedRef.current) return

    const apiUrl = (import.meta.env.VITE_API_URL as string)
      .replace('https://', 'wss://')
      .replace('http://', 'ws://')

    const ws = new WebSocket(`${apiUrl}/api/battles/${battleId}/ws`)
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
      let msg: WSMessage
      try {
        msg = JSON.parse(e.data as string) as WSMessage
      } catch {
        return
      }

      if (msg.type === 'state') {
        setWsState((prev) => ({
          ...prev,
          scores: msg.scores,
          battleStatus: msg.status === 'completed' ? 'completed' : 'active',
        }))
      } else if (msg.type === 'score_update') {
        setWsState((prev) => ({
          ...prev,
          scores: msg.scores,
          solves: [...prev.solves, { userId: msg.solver_id, problemIndex: msg.problem_index }],
        }))
      } else if (msg.type === 'battle_result') {
        clearInterval(pingRef.current)
        setWsState((prev) => ({
          ...prev,
          scores: msg.scores,
          battleStatus: 'completed',
          winnerId: msg.winner_id,
        }))
      }
    }

    ws.onclose = () => {
      clearInterval(pingRef.current)
      if (unmountedRef.current) return
      setWsState((prev) =>
        prev.battleStatus === 'completed'
          ? prev
          : { ...prev, battleStatus: 'connecting' },
      )
      const delay = BACKOFF[Math.min(attemptRef.current, BACKOFF.length - 1)]
      attemptRef.current++
      setTimeout(connect, delay)
    }

    ws.onerror = () => ws.close()
  }, [battleId])

  useEffect(() => {
    connect()
    return () => {
      unmountedRef.current = true
      clearInterval(pingRef.current)
      wsRef.current?.close(1000, 'unmount')
    }
  }, [connect])

  const sendSolved = useCallback((problemIndex: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'problem_solved', problem_index: problemIndex }))
    }
  }, [])

  return { ...wsState, sendSolved }
}
