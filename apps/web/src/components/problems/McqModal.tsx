import { useState } from 'react'
import { motion } from 'motion/react'
import {
  IconX,
  IconBulb,
  IconCheck,
  IconChevronRight,
  IconLoader2,
} from '@tabler/icons-react'
import type { Problem, McqContent } from '../../store/progressStore'
import { useProgressStore } from '../../store/progressStore'
import api from '../../lib/api'

interface McqResult {
  is_correct: boolean
  correct_index: number
  explanation: string
  xp_gained: number | null
}

interface McqModalProps {
  problem: Problem
  onClose: () => void
  onNext?: () => void
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const

const DIFF_BADGE: Record<string, string> = {
  easy: 'bg-emerald-500/15 text-emerald-500',
  medium: 'bg-amber-500/15 text-amber-500',
  hard: 'bg-red-500/15 text-red-500',
}

function optionStyle(
  idx: number,
  selectedIndex: number | null,
  result: McqResult | null,
): string {
  const base = 'flex items-start gap-2.5 p-3 rounded-xl border-2 transition-all text-left w-full'
  if (!result) {
    if (selectedIndex === idx)
      return `${base} border-(--color-accent) bg-(--color-accent)/8 ring-1 ring-(--color-accent)`
    return `${base} border-(--color-border) bg-(--color-bg) hover:border-(--color-accent)/40 cursor-pointer`
  }
  if (idx === result.correct_index)
    return `${base} border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500`
  if (idx === selectedIndex && !result.is_correct)
    return `${base} border-red-500 bg-red-500/10 ring-1 ring-red-500`
  return `${base} border-(--color-border) bg-(--color-bg) opacity-40`
}

export default function McqModal({ problem, onClose, onNext }: McqModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [result, setResult] = useState<McqResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { updateMcqProgress } = useProgressStore()

  // content comes pre-parsed from the API as { question, options }
  const content = problem.content as McqContent | null

  async function handleSubmit() {
    if (selectedIndex === null || submitting || !content) return
    setSubmitting(true)
    try {
      const { data } = await api.post<McqResult>(
        `/api/progress/${problem.id}/mcq-attempt`,
        { selected_index: selectedIndex },
      )
      setResult(data)
      updateMcqProgress(problem.id, data.is_correct)
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  if (!content) return null

  const isSubmitted = result !== null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="relative w-full max-w-lg bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--color-border)">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-(--color-bg) border border-(--color-border) text-(--color-text-secondary) font-medium">
              {problem.topic}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFF_BADGE[problem.difficulty] ?? ''}`}
            >
              {problem.difficulty[0].toUpperCase() + problem.difficulty.slice(1)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-500 font-semibold">
              MCQ
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg) transition-colors"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Question */}
          <p className="text-[15px] font-medium text-(--color-text-primary) leading-relaxed">
            {content.question}
          </p>

          {/* 2×2 Options grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {content.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => !isSubmitted && setSelectedIndex(idx)}
                disabled={isSubmitted}
                className={optionStyle(idx, selectedIndex, result)}
              >
                <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-(--color-accent)/15 text-(--color-accent) text-[10px] font-bold">
                  {OPTION_LETTERS[idx]}
                </span>
                <span className="text-sm text-(--color-text-primary) leading-snug flex-1">
                  {opt}
                </span>
                {isSubmitted && idx === result!.correct_index && (
                  <IconCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>

          {/* Result state */}
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${
                  result!.is_correct
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                {result!.is_correct ? (
                  <>
                    <motion.span
                      initial={{ scale: 0.5, rotate: -15 }}
                      animate={{ scale: [0.5, 1.3, 1], rotate: [-15, 10, 0] }}
                      transition={{ duration: 0.45 }}
                      className="text-xl"
                    >
                      🎉
                    </motion.span>
                    <div>
                      <p className="text-sm font-bold text-emerald-500">Correct!</p>
                      {result!.xp_gained != null && (
                        <p className="text-xs text-emerald-500/80">
                          +{result!.xp_gained} XP earned
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-xl">😕</span>
                    <p className="text-sm font-bold text-red-400">Incorrect — check the correct answer above</p>
                  </>
                )}
              </div>

              {result!.explanation && (
                <div className="flex gap-2.5 p-3.5 bg-(--color-bg) rounded-xl border border-(--color-border)">
                  <IconBulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                    {result!.explanation}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-(--color-border) flex items-center gap-2.5">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedIndex === null || submitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-(--color-accent) text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting && <IconLoader2 size={14} className="animate-spin" />}
              {submitting ? 'Submitting…' : 'Submit Answer'}
            </button>
          ) : (
            <>
              {onNext && (
                <button
                  onClick={onNext}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-(--color-accent) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Next Question
                  <IconChevronRight size={14} />
                </button>
              )}
              <button
                onClick={onClose}
                className={`${onNext ? '' : 'flex-1'} py-2.5 px-4 rounded-xl border border-(--color-border) text-(--color-text-secondary) text-sm font-medium hover:bg-(--color-bg) transition-colors`}
              >
                {onNext ? 'View All' : 'View All Questions'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
