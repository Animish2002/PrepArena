import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  IconX,
  IconExternalLink,
  IconBookmark,
  IconBookmarkFilled,
  IconClock,
  IconCheck,
} from '@tabler/icons-react'
import { useProgressStore, type Problem } from '../../store/progressStore'
import { useSolveTimer, formatElapsed } from '../../hooks/useSolveTimer'
import api from '../../lib/api'

interface ProblemDrawerProps {
  problem: Problem | null
  onClose: () => void
}

type Phase = 'idle' | 'timing' | 'confidence' | 'success'

const CONFIDENCE_OPTIONS = [
  { value: 1, emoji: '😕', label: "Didn't get it", desc: 'Need to revisit the approach' },
  { value: 2, emoji: '🤔', label: 'Needs revision', desc: 'Got it but needs more practice' },
  { value: 3, emoji: '👍', label: 'Got it', desc: 'Can solve independently' },
  { value: 4, emoji: '🚀', label: 'Mastered', desc: 'Fast and intuitive' },
]

const DIFF_BADGE: Record<string, string> = {
  easy: 'bg-emerald-500/15 text-emerald-500',
  medium: 'bg-amber-500/15 text-amber-500',
  hard: 'bg-red-500/15 text-red-500',
}

export default function ProblemDrawer({ problem, onClose }: ProblemDrawerProps) {
  const { markSolved, markAttempted, bookmarks, toggleBookmark, userProgress } = useProgressStore()
  const { startTimer, stopTimer, resetTimer, elapsed, isRunning } = useSolveTimer()

  const [phase, setPhase] = useState<Phase>('idle')
  const [selectedConfidence, setSelectedConfidence] = useState<number | null>(null)
  const [xpGained, setXpGained] = useState(0)
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const timerResultRef = useRef<{ started_at: number; duration_seconds: number } | null>(null)
  const notesTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Reset state when problem changes
  useEffect(() => {
    if (!problem) return
    setPhase('idle')
    setSelectedConfidence(null)
    setNotesSaved(false)
    setXpGained(0)
    resetTimer()
    timerResultRef.current = null

    // Check if timer was running for this problem (resume after navigation)
    const saved = sessionStorage.getItem(`preparena_timer_${problem.id}`)
    if (saved) {
      startTimer(problem.id)
      setPhase('timing')
    }

    // Fetch existing notes
    api
      .get<{ notes: { content: string } | null }>(`/api/problems/${problem.id}`)
      .then((r) => setNotes(r.data.notes?.content ?? ''))
      .catch(() => {})
  }, [problem?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenProblem = () => {
    if (problem?.platformLink) {
      window.open(problem.platformLink, '_blank', 'noopener,noreferrer')
    }
    startTimer(problem?.id)
    setPhase('timing')
  }

  const handleMarkSolved = () => {
    const result = stopTimer()
    timerResultRef.current = result
    setPhase('confidence')
  }

  const handleAttempted = async () => {
    stopTimer()
    if (problem) await markAttempted(problem.id).catch(() => {})
    resetTimer()
    onClose()
  }

  const handleSubmit = async () => {
    if (!problem || !selectedConfidence || !timerResultRef.current) return
    setSubmitting(true)
    try {
      const { xp_gained } = await markSolved(problem.id, {
        confidence: selectedConfidence,
        ...timerResultRef.current,
      })
      setXpGained(xp_gained)
      setPhase('success')
      setTimeout(onClose, 2000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
    setNotesSaved(false)
    clearTimeout(notesTimeoutRef.current)
    notesTimeoutRef.current = setTimeout(() => {
      if (problem) {
        api
          .put(`/api/problems/${problem.id}/notes`, { content: e.target.value })
          .then(() => setNotesSaved(true))
          .catch(() => {})
      }
    }, 800)
  }

  const isBookmarked = problem ? (bookmarks[problem.id] ?? false) : false
  const progress = problem ? userProgress[problem.id] : null

  return (
    <AnimatePresence>
      {problem && (
        <>
          {/* Backdrop (mobile only) */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-(--color-surface) border-l border-(--color-border) shadow-2xl"
          >
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="shrink-0 border-b border-(--color-border) p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-base font-semibold text-(--color-text-primary) leading-snug">
                  {problem.title}
                </h2>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleBookmark(problem.id)}
                    className="p-1.5 rounded-lg hover:bg-(--color-bg) transition-colors text-(--color-text-secondary)"
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    {isBookmarked ? (
                      <IconBookmarkFilled size={18} className="text-(--color-accent)" />
                    ) : (
                      <IconBookmark size={18} />
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-(--color-bg) transition-colors text-(--color-text-secondary)"
                    aria-label="Close"
                  >
                    <IconX size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFF_BADGE[problem.difficulty] ?? ''}`}
                >
                  {problem.difficulty[0].toUpperCase() + problem.difficulty.slice(1)}
                </span>
                <span className="text-xs text-(--color-text-secondary) bg-(--color-bg) px-2 py-0.5 rounded-full">
                  {problem.topic}
                </span>
                {problem.estimatedMinutes && (
                  <span className="flex items-center gap-1 text-xs text-(--color-text-secondary)">
                    <IconClock size={12} />
                    {problem.estimatedMinutes}m
                  </span>
                )}
                {progress?.status === 'solved' && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <IconCheck size={12} />
                    Solved
                  </span>
                )}
              </div>
            </div>

            {/* ── Scrollable body ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

              {/* Phase: idle */}
              {phase === 'idle' && (
                <div className="space-y-3">
                  <p className="text-sm text-(--color-text-secondary)">
                    Open the problem and start your timer when ready.
                  </p>
                  {problem.platformLink ? (
                    <button
                      onClick={handleOpenProblem}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-(--color-accent) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      <IconExternalLink size={16} />
                      Open Problem &amp; Start Timer
                    </button>
                  ) : (
                    <button
                      onClick={() => { startTimer(problem.id); setPhase('timing') }}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-(--color-accent) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Start Timer
                    </button>
                  )}
                </div>
              )}

              {/* Phase: timing */}
              {phase === 'timing' && (
                <div className="space-y-4">
                  {/* Timer display */}
                  <div className="flex flex-col items-center py-6 bg-(--color-bg) rounded-2xl border border-(--color-border)">
                    <p className="text-xs text-(--color-text-secondary) mb-1 uppercase tracking-wider font-medium">
                      Time elapsed
                    </p>
                    <p className="text-5xl font-black text-(--color-text-primary) tabular-nums tracking-tight">
                      {formatElapsed(elapsed)}
                    </p>
                    {isRunning && (
                      <span className="mt-2 flex items-center gap-1.5 text-xs text-emerald-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Timer running
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleMarkSolved}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Done — Mark Solved
                  </button>
                  <button
                    onClick={handleAttempted}
                    className="w-full py-2 rounded-xl border border-(--color-border) text-(--color-text-secondary) text-sm hover:bg-(--color-bg) transition-colors"
                  >
                    Just Attempted
                  </button>
                </div>
              )}

              {/* Phase: confidence */}
              {phase === 'confidence' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-(--color-text-primary)">You did it! 🎉</p>
                    <p className="text-sm text-(--color-text-secondary) mt-1">
                      Solved in{' '}
                      <span className="font-semibold text-(--color-text-primary)">
                        {formatElapsed(timerResultRef.current?.duration_seconds ?? 0)}
                      </span>
                    </p>
                    <p className="text-sm text-(--color-text-secondary) mt-3">
                      How confident do you feel?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {CONFIDENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedConfidence(opt.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-left ${
                          selectedConfidence === opt.value
                            ? 'border-(--color-accent) bg-(--color-accent)/8'
                            : 'border-(--color-border) hover:border-(--color-accent)/50 bg-(--color-bg)'
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-xs font-semibold text-(--color-text-primary) text-center leading-tight">
                          {opt.label}
                        </span>
                        <span className="text-xs text-(--color-text-secondary) text-center leading-tight">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!selectedConfidence || submitting}
                    className="w-full py-2.5 rounded-xl bg-(--color-accent) text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving…' : 'Submit'}
                  </button>
                </div>
              )}

              {/* Phase: success */}
              {phase === 'success' && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: [0.4, 1.25, 1], opacity: [0, 1, 1] }}
                    transition={{ duration: 0.55, times: [0, 0.65, 1], ease: 'easeOut' }}
                    className="flex flex-col items-center"
                  >
                    <p className="text-6xl font-black text-amber-500 tabular-nums">+{xpGained}</p>
                    <p className="text-sm font-semibold text-(--color-text-secondary) mt-1">XP gained</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="text-3xl">🎊</span>
                    <p className="text-sm text-(--color-text-secondary)">Problem marked solved!</p>
                  </motion.div>
                </div>
              )}

              {/* Notes — always visible (except success) */}
              {phase !== 'success' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wider">
                      Notes
                    </label>
                    {notesSaved && (
                      <span className="text-xs text-emerald-500 flex items-center gap-1">
                        <IconCheck size={11} />
                        Saved
                      </span>
                    )}
                  </div>
                  <textarea
                    value={notes}
                    onChange={handleNotesChange}
                    placeholder="Jot down your approach, key insights, or things to remember…"
                    rows={5}
                    className="w-full resize-none rounded-xl border border-(--color-border) bg-(--color-bg) text-sm text-(--color-text-primary) p-3 placeholder:text-(--color-text-secondary)/60 focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40 transition-shadow"
                  />
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
