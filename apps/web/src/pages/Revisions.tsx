import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconCalendarCheck, IconCalendar, IconCheck, IconExternalLink } from '@tabler/icons-react'
import api from '../lib/api'
import ProblemDrawer from '../components/problems/ProblemDrawer'
import type { Problem } from '../store/progressStore'

interface RevisionItem {
  id: string
  dueDate: number
  problemId: string
  title: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  platform: string | null
  platformLink: string | null
  confidence: number | null
  lastSolvedAt: number | null
}

type UpcomingGroup = Record<string, RevisionItem[]>

const DIFF_BADGE: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-500',
  medium: 'bg-amber-500/10 text-amber-500',
  hard: 'bg-red-500/10 text-red-500',
}

const CONFIDENCE_EMOJI: Record<number, string> = { 1: '😕', 2: '🤔', 3: '👍', 4: '🚀' }

function formatDate(dateStr: string) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dateStr === today.toISOString().slice(0, 10)) return 'Today'
  if (dateStr === tomorrow.toISOString().slice(0, 10)) return 'Tomorrow'

  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function revisionToProb(rev: RevisionItem): Problem {
  return {
    id: rev.problemId,
    title: rev.title,
    topic: rev.topic,
    difficulty: rev.difficulty,
    platform: rev.platform,
    platformLink: rev.platformLink,
  }
}

function Skeleton() {
  return (
    <div className="animate-pulse flex items-center gap-3 p-4 bg-(--color-surface) border border-(--color-border) rounded-2xl">
      <div className="w-14 h-5 bg-(--color-border) rounded-full opacity-40" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-(--color-border) rounded w-2/3 opacity-40" />
        <div className="h-3 bg-(--color-border) rounded w-1/3 opacity-40" />
      </div>
      <div className="w-16 h-8 bg-(--color-border) rounded-xl opacity-40" />
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 gap-4"
    >
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="currentColor"
          strokeWidth="2"
          className="text-(--color-border)"
        />
        <path
          d="M26 40l10 10 18-18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-500"
        />
      </svg>
      <div className="text-center">
        <p className="text-base font-semibold text-(--color-text-primary)">All caught up!</p>
        <p className="text-sm text-(--color-text-secondary) mt-1">No revisions due today.</p>
      </div>
    </motion.div>
  )
}

export default function RevisionsPage() {
  const [todayRevisions, setTodayRevisions] = useState<RevisionItem[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingGroup>({})
  const [loading, setLoading] = useState(true)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [activeRevision, setActiveRevision] = useState<{ problem: Problem; revisionId: string } | null>(
    null,
  )

  useEffect(() => {
    Promise.all([
      api.get<{ revisions: RevisionItem[]; count: number }>('/api/progress/revisions/today'),
      api.get<{ upcoming: UpcomingGroup }>('/api/progress/revisions/upcoming'),
    ])
      .then(([todayRes, upcomingRes]) => {
        setTodayRevisions(todayRes.data.revisions)
        setUpcoming(upcomingRes.data.upcoming ?? {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function completeRevision(id: string) {
    setCompletingId(id)
    try {
      await api.post(`/api/progress/revisions/${id}/complete`)
      setTodayRevisions((rs) => rs.filter((r) => r.id !== id))
    } finally {
      setCompletingId(null)
    }
  }

  function openRevision(rev: RevisionItem) {
    setActiveRevision({ problem: revisionToProb(rev), revisionId: rev.id })
  }

  const upcomingDates = Object.keys(upcoming).sort()

  return (
    <div className="max-w-3xl space-y-8 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-(--color-text-primary)">Revisions</h1>
        <p className="text-sm text-(--color-text-secondary) mt-1">
          Spaced repetition keeps concepts sharp
        </p>
      </div>

      {/* Today's Queue */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconCalendarCheck size={18} className="text-(--color-accent)" />
            <h2 className="text-base font-semibold text-(--color-text-primary)">Today's Queue</h2>
          </div>
          {!loading && todayRevisions.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-(--color-accent)/10 text-(--color-accent)">
              {todayRevisions.length} remaining
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : todayRevisions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {todayRevisions.map((rev, i) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                  exit={{ opacity: 0, x: -24, scale: 0.97, transition: { duration: 0.18 } }}
                  className="flex items-center gap-3 p-4 bg-(--color-surface) border border-(--color-border) rounded-2xl hover:border-(--color-accent)/30 transition-colors"
                >
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${DIFF_BADGE[rev.difficulty] ?? ''}`}
                  >
                    {rev.difficulty[0].toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-(--color-text-primary) truncate">
                      {rev.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-(--color-text-secondary)">{rev.topic}</span>
                      {rev.confidence != null && (
                        <span
                          className="text-xs text-(--color-text-secondary)"
                          title={`Last confidence`}
                        >
                          · {CONFIDENCE_EMOJI[rev.confidence]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openRevision(rev)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-(--color-accent) text-white hover:opacity-90 transition-opacity"
                    >
                      Revise
                    </button>
                    <button
                      onClick={() => completeRevision(rev.id)}
                      disabled={completingId === rev.id}
                      title="Mark done without re-solving"
                      className="p-1.5 rounded-xl border border-(--color-border) text-(--color-text-secondary) hover:text-emerald-500 hover:border-emerald-500/40 transition-colors disabled:opacity-40"
                    >
                      <IconCheck size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Upcoming */}
      {!loading && upcomingDates.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <IconCalendar size={18} className="text-(--color-text-secondary)" />
            <h2 className="text-base font-semibold text-(--color-text-primary)">Upcoming</h2>
          </div>
          <div className="space-y-6">
            {upcomingDates.map((date) => (
              <div key={date}>
                <p className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wider mb-2">
                  {formatDate(date)}
                  <span className="ml-2 font-normal normal-case">
                    · {upcoming[date].length} problem
                    {upcoming[date].length !== 1 ? 's' : ''}
                  </span>
                </p>
                <div className="space-y-2">
                  {upcoming[date].map((rev) => (
                    <div
                      key={rev.id}
                      className="flex items-center gap-3 p-3 bg-(--color-surface) border border-(--color-border) rounded-xl"
                    >
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${DIFF_BADGE[rev.difficulty] ?? ''}`}
                      >
                        {rev.difficulty[0].toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-(--color-text-primary) truncate">{rev.title}</p>
                        <p className="text-xs text-(--color-text-secondary)">{rev.topic}</p>
                      </div>
                      {rev.platformLink && (
                        <a
                          href={rev.platformLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-(--color-text-secondary) hover:text-(--color-accent) transition-colors"
                        >
                          <IconExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <ProblemDrawer
        problem={activeRevision?.problem ?? null}
        revisionId={activeRevision?.revisionId}
        onClose={() => setActiveRevision(null)}
        onRevisionComplete={(id) => setTodayRevisions((rs) => rs.filter((r) => r.id !== id))}
      />
    </div>
  )
}
