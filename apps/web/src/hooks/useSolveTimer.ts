import { useRef, useState, useEffect, useCallback } from 'react'

const SESSION_PREFIX = 'preparena_timer_'

export interface StopResult {
  started_at: number
  duration_seconds: number
}

export function useSolveTimer() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startedAtRef = useRef<number | null>(null)
  const problemIdRef = useRef<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback((problemId?: string) => {
    const key = problemId ? `${SESSION_PREFIX}${problemId}` : SESSION_PREFIX
    const saved = sessionStorage.getItem(key)
    const startedAt = saved ? Number(saved) : Date.now()

    startedAtRef.current = startedAt
    problemIdRef.current = problemId ?? null
    sessionStorage.setItem(key, String(startedAt))

    setIsRunning(true)
    setElapsed(Math.floor((Date.now() - startedAt) / 1000))

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1000))
    }, 1000)
  }, [])

  const stopTimer = useCallback((): StopResult => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const startedAt = startedAtRef.current ?? Date.now()
    const duration_seconds = Math.max(1, Math.floor((Date.now() - startedAt) / 1000))

    if (problemIdRef.current) {
      sessionStorage.removeItem(`${SESSION_PREFIX}${problemIdRef.current}`)
    }
    sessionStorage.removeItem(SESSION_PREFIX)

    setIsRunning(false)

    return { started_at: startedAt, duration_seconds }
  }, [])

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (problemIdRef.current) {
      sessionStorage.removeItem(`${SESSION_PREFIX}${problemIdRef.current}`)
    }
    startedAtRef.current = null
    problemIdRef.current = null
    setElapsed(0)
    setIsRunning(false)
  }, [])

  // Persist on page unload so timer survives navigation
  useEffect(() => {
    const handle = () => {
      if (isRunning && startedAtRef.current) {
        const key = problemIdRef.current
          ? `${SESSION_PREFIX}${problemIdRef.current}`
          : SESSION_PREFIX
        sessionStorage.setItem(key, String(startedAtRef.current))
      }
    }
    window.addEventListener('beforeunload', handle)
    return () => window.removeEventListener('beforeunload', handle)
  }, [isRunning])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return { startTimer, stopTimer, resetTimer, elapsed, isRunning }
}

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
