import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  IconFlame,
  IconBolt,
  IconCheck,
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconMedal,
  IconTrophy,
  IconX,
} from '@tabler/icons-react'
import confetti from 'canvas-confetti'
import api from '../lib/api'
import ProblemDrawer from '../components/problems/ProblemDrawer'
import { useChallengeStore } from '../store/challengeStore'
import type { Problem } from '../store/progressStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChallengeProb {
  id: string
  title: string
  topic: string
  difficulty: string | null
  platform: string | null
  platformLink: string | null
  estimatedMinutes: number | null
  userStatus: string | null
}

interface Challenge {
  id: string
  weekStart: number
  weekEnd: number
  title: string
  description: string
  type: string
  typeLabel: string
  xpReward: number
  badgeName: string
  totalProblems: number
  problems: ChallengeProb[]
}

interface UserCompletion {
  problemsSolved: number
  totalProblems: number
  completed: boolean
  totalTimeSeconds: number
  completedAt?: number | null
  xpAwarded: number
}

interface HistoryItem {
  id: string
  weekStart: number
  weekEnd: number
  title: string
  typeLabel: string
  xpReward: number
  badgeName: string
  totalProblems: number
  completion: {
    problemsSolved: number
    totalProblems: number
    completed: boolean
    badgeEarned: boolean
    xpAwarded: number
  } | null
}

interface HistoryLeaderboardEntry {
  rank: number
  userId: string
  name: string
  username: string
  avatarUrl?: string | null
  problemsSolved: number
  totalProblems: number
  completed: boolean
  totalTimeSeconds: number
  isCurrentUser: boolean
  isFriend: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0s'
  const totalSeconds = Math.floor(ms / 1000)
  const d = Math.floor(totalSeconds / 86400)
  const h = Math.floor((totalSeconds % 86400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
}

const DIFF_BADGE: Record<string, string> = {
  easy:   'bg-emerald-500/15 text-emerald-500',
  medium: 'bg-amber-500/15 text-amber-500',
  hard:   'bg-red-500/15 text-red-500',
}

const TYPE_COLORS: Record<string, string> = {
  topic_blitz: 'bg-violet-500/15 text-violet-500',
  speed_run:   'bg-amber-500/15 text-amber-500',
  accuracy:    'bg-blue-500/15 text-blue-500',
  mixed:       'bg-emerald-500/15 text-emerald-500',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  name,
  avatarUrl,
  size = 36,
}: {
  name: string
  avatarUrl?: string | null
  size?: number
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full bg-(--color-accent)/15 flex items-center justify-center text-(--color-accent) font-bold shrink-0 select-none"
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-amber-400 font-bold text-sm">🥇</span>
  if (rank === 2) return <span className="text-slate-400 font-bold text-sm">🥈</span>
  if (rank === 3) return <span className="text-orange-500 font-bold text-sm">🥉</span>
  return <span className="text-(--color-text-secondary) text-xs font-semibold tabular-nums w-5 text-center">#{rank}</span>
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChallengePage() {
  const { leaderboard, setLeaderboard } = useChallengeStore()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [completion, setCompletion] = useState<UserCompletion | null>(null)
  const [loading, setLoading] = useState(true)
  const [noChallenge, setNoChallenge] = useState(false)

  const [selectedProblem, setSelectedProblem] = useState<ChallengeProb | null>(null)
  const [localSolvedIds, setLocalSolvedIds] = useState<Set<string>>(new Set())

  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyModal, setHistoryModal] = useState<HistoryItem | null>(null)
  const [historyLeaderboard, setHistoryLeaderboard] = useState<HistoryLeaderboardEntry[]>([])
  const [historyLbLoading, setHistoryLbLoading] = useState(false)

  const confettiFired = useRef(false)

  // ── Fetch current challenge ─────────────────────────────────────────────
  const fetchCurrent = useCallback(async () => {
    try {
      const { data } = await api.get<{
        challenge: Challenge | null
        user_completion: UserCompletion | null
        leaderboard: typeof leaderboard
      }>('/api/challenges/current')

      if (!data.challenge) {
        setNoChallenge(true)
        return
      }

      setChallenge(data.challenge)
      setCompletion(data.user_completion)
      setLeaderboard(data.leaderboard)

      // Seed local solved ids from server state
      const solvedIds = new Set<string>(
        data.challenge.problems
          .filter((p) => p.userStatus === 'solved')
          .map((p) => p.id),
      )
      setLocalSolvedIds(solvedIds)

      // Start countdown
      setTimeLeft(Math.max(0, data.challenge.weekEnd - Date.now()))
    } catch {
      setNoChallenge(true)
    } finally {
      setLoading(false)
    }
  }, [setLeaderboard])

  useEffect(() => {
    fetchCurrent()
    // Mark challenge as seen this week (dismiss sidebar dot)
    const today = new Date()
    const monday = new Date(today)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    localStorage.setItem('preparena_last_seen_challenge', monday.toISOString().slice(0, 10))
  }, [fetchCurrent])

  // ── Countdown ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!challenge) return
    timerRef.current = setInterval(() => {
      setTimeLeft(Math.max(0, challenge.weekEnd - Date.now()))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [challenge])

  // ── Confetti on completion ──────────────────────────────────────────────
  useEffect(() => {
    if (completion?.completed && !confettiFired.current) {
      confettiFired.current = true
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.55 } })
    }
  }, [completion?.completed])

  // ── Handle a problem being solved from the drawer ───────────────────────
  const handleSolve = useCallback(
    async (problemId: string) => {
      setLocalSolvedIds((prev) => new Set([...prev, problemId]))

      try {
        const { data } = await api.post<{
          inChallenge: boolean
          problemsSolved?: number
          totalProblems?: number
          completed?: boolean
          xpAwarded?: number
        }>(`/api/challenges/current/solve/${problemId}`)

        if (data.inChallenge && data.problemsSolved !== undefined) {
          setCompletion((prev) => ({
            problemsSolved: data.problemsSolved!,
            totalProblems: data.totalProblems ?? prev?.totalProblems ?? 0,
            completed: data.completed ?? false,
            totalTimeSeconds: prev?.totalTimeSeconds ?? 0,
            completedAt: data.completed ? Date.now() : prev?.completedAt,
            xpAwarded: data.xpAwarded ?? prev?.xpAwarded ?? 0,
          }))

          if (data.completed && !confettiFired.current) {
            confettiFired.current = true
            setTimeout(() => confetti({ particleCount: 200, spread: 90, origin: { y: 0.55 } }), 300)
          }
        }
      } catch {
        // Non-critical — progress already recorded via solve route
      }
    },
    [],
  )

  // ── History ─────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (historyLoading || history.length > 0) return
    setHistoryLoading(true)
    try {
      const { data } = await api.get<{ history: HistoryItem[] }>('/api/challenges/history')
      setHistory(data.history)
    } catch {
      /* no-op */
    } finally {
      setHistoryLoading(false)
    }
  }, [historyLoading, history.length])

  useEffect(() => {
    if (historyOpen) loadHistory()
  }, [historyOpen, loadHistory])

  const openHistoryModal = async (item: HistoryItem) => {
    setHistoryModal(item)
    setHistoryLbLoading(true)
    try {
      const { data } = await api.get<{ leaderboard: HistoryLeaderboardEntry[] }>(
        `/api/challenges/leaderboard/${item.id}`,
      )
      setHistoryLeaderboard(data.leaderboard)
    } catch {
      /* no-op */
    } finally {
      setHistoryLbLoading(false)
    }
  }

  // ── Progress numbers ─────────────────────────────────────────────────────
  const problemsSolved = completion?.problemsSolved ?? localSolvedIds.size
  const totalProblems = challenge?.totalProblems ?? 0
  const progressPct = totalProblems > 0 ? Math.round((problemsSolved / totalProblems) * 100) : 0
  const isCompleted = completion?.completed ?? false

  // ── Drawer: convert ChallengeProb to Problem shape ───────────────────────
  const drawerProblem: Problem | null = selectedProblem
    ? {
        id: selectedProblem.id,
        title: selectedProblem.title,
        topic: selectedProblem.topic,
        subtopic: null,
        difficulty: selectedProblem.difficulty as Problem['difficulty'],
        platform: selectedProblem.platform,
        platformLink: selectedProblem.platformLink,
        estimatedMinutes: selectedProblem.estimatedMinutes,
        problemNumber: null,
        tags: null,
      }
    : null

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <IconLoader2 size={28} className="animate-spin text-(--color-text-secondary)" />
      </div>
    )
  }

  if (noChallenge || !challenge) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <IconFlame size={40} className="text-(--color-text-secondary) opacity-30" />
        <p className="text-(--color-text-primary) font-semibold">No challenge this week yet</p>
        <p className="text-sm text-(--color-text-secondary)">
          Challenges go live every Monday — check back soon!
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6 pb-20 lg:pb-0">
      {/* ── Hero card ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl border p-6 ${
          isCompleted
            ? 'bg-emerald-500/5 border-emerald-500/30'
            : 'bg-(--color-surface) border-(--color-border)'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[challenge.type] ?? 'bg-(--color-border) text-(--color-text-secondary)'}`}
              >
                {challenge.typeLabel}
              </span>
              {isCompleted && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
                  ✓ Completed
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-(--color-text-primary) mb-1">
              {challenge.title}
            </h1>
            <p className="text-sm text-(--color-text-secondary)">{challenge.description}</p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-amber-500 text-sm font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl">
              <IconBolt size={15} />
              +{challenge.xpReward} XP
            </div>
            <div className="flex items-center gap-1.5 text-(--color-text-secondary) text-xs">
              <IconMedal size={13} />
              {challenge.badgeName}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-(--color-text-secondary) font-medium">
              {problemsSolved} / {totalProblems} problems solved
            </span>
            <span className="text-(--color-text-secondary)">{progressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-(--color-border) overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-(--color-accent)'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Countdown */}
        {!isCompleted ? (
          <div className="flex items-center gap-1.5 text-sm text-(--color-text-secondary)">
            <IconClock size={14} />
            <span>Ends in </span>
            <span className="font-semibold text-(--color-text-primary) tabular-nums">
              {formatCountdown(timeLeft)}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-emerald-500">
              🎉 You earned the <span className="font-bold">{challenge.badgeName}</span> badge and{' '}
              +{completion?.xpAwarded ?? challenge.xpReward} XP!
            </p>
            {completion?.completedAt && (
              <p className="text-xs text-(--color-text-secondary)">
                Completed {new Date(completion.completedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Problem list ──────────────────────────────────────────────────────── */}
      <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-(--color-border)">
          <h2 className="text-sm font-semibold text-(--color-text-primary)">Challenge Problems</h2>
        </div>
        <div className="divide-y divide-(--color-border)">
          {challenge.problems.map((prob, idx) => {
            const solved =
              localSolvedIds.has(prob.id) || prob.userStatus === 'solved'
            return (
              <button
                key={prob.id}
                onClick={() => setSelectedProblem(prob)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-(--color-bg) transition-colors text-left group"
              >
                {/* Solve indicator */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    solved
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-(--color-border) bg-(--color-bg) group-hover:border-(--color-accent)/50'
                  }`}
                >
                  {solved && <IconCheck size={12} className="text-white" strokeWidth={3} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-(--color-text-secondary) tabular-nums">#{idx + 1}</span>
                    <span className="text-sm font-medium text-(--color-text-primary) truncate">
                      {prob.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {prob.difficulty && (
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${DIFF_BADGE[prob.difficulty] ?? ''}`}>
                        {prob.difficulty}
                      </span>
                    )}
                    <span className="text-xs text-(--color-text-secondary)">{prob.topic}</span>
                    {prob.estimatedMinutes && (
                      <span className="text-xs text-(--color-text-secondary) flex items-center gap-0.5">
                        <IconClock size={11} />
                        ~{prob.estimatedMinutes}m
                      </span>
                    )}
                  </div>
                </div>

                {solved ? (
                  <span className="text-xs font-semibold text-emerald-500 shrink-0">Solved ✓</span>
                ) : (
                  <span className="text-xs text-(--color-text-secondary) shrink-0 group-hover:text-(--color-accent) transition-colors">
                    Solve →
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Friend leaderboard ────────────────────────────────────────────────── */}
      <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-(--color-border)">
          <h2 className="text-sm font-semibold text-(--color-text-primary)">
            Friend Leaderboard
          </h2>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-sm text-(--color-text-secondary) text-center py-8">
            Add friends to see how you compare!
          </p>
        ) : (
          <div className="divide-y divide-(--color-border)">
            <AnimatePresence mode="popLayout">
              {leaderboard.map((row) => (
                <motion.div
                  key={row.userId}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-center gap-4 px-5 py-3 ${
                    row.isCurrentUser ? 'bg-(--color-accent)/5' : ''
                  }`}
                >
                  <div className="w-8 flex justify-center shrink-0">
                    <RankMedal rank={row.rank} />
                  </div>

                  <Avatar name={row.name} avatarUrl={row.avatarUrl} size={34} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-(--color-text-primary) truncate">
                      {row.name}
                      {row.isCurrentUser && (
                        <span className="ml-1.5 text-xs text-(--color-accent) font-semibold">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-(--color-text-secondary)">@{row.username}</p>
                  </div>

                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <p className="text-sm font-semibold text-(--color-text-primary) tabular-nums">
                      {row.problemsSolved} / {row.totalProblems}
                    </p>
                    <p className="text-xs text-(--color-text-secondary) tabular-nums">
                      {row.totalTimeSeconds > 0 ? formatTime(row.totalTimeSeconds) : '—'}
                    </p>
                  </div>

                  <div className="w-6 shrink-0">
                    {row.completed && (
                      <IconTrophy size={16} className="text-amber-400" title="Completed" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Past Challenges ───────────────────────────────────────────────────── */}
      <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl overflow-hidden">
        <button
          onClick={() => setHistoryOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-(--color-bg) transition-colors"
        >
          <h2 className="text-sm font-semibold text-(--color-text-primary)">Past Challenges</h2>
          {historyOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {historyOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              {historyLoading ? (
                <div className="flex items-center justify-center py-10">
                  <IconLoader2 size={22} className="animate-spin text-(--color-text-secondary)" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-(--color-text-secondary) text-center py-8 px-5">
                  No past challenges yet
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-5">
                  {history.map((item) => {
                    const comp = item.completion
                    const earned = comp?.badgeEarned ?? false
                    return (
                      <button
                        key={item.id}
                        onClick={() => openHistoryModal(item)}
                        className={`p-3 rounded-xl border text-left hover:scale-[1.02] transition-transform ${
                          earned
                            ? 'border-amber-400/40 bg-amber-500/5'
                            : 'border-(--color-border) bg-(--color-bg)'
                        }`}
                      >
                        <p className="text-xs font-bold text-(--color-text-primary) mb-0.5 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-(--color-text-secondary) mb-1.5">
                          {new Date(item.weekStart).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </p>
                        {comp ? (
                          earned ? (
                            <p className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                              <IconMedal size={11} /> {item.badgeName}
                            </p>
                          ) : (
                            <p className="text-xs text-(--color-text-secondary)">
                              {comp.problemsSolved}/{item.totalProblems}
                            </p>
                          )
                        ) : (
                          <p className="text-xs text-(--color-text-secondary) opacity-50">Not attempted</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── History leaderboard modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {historyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setHistoryModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--color-surface) border border-(--color-border) rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border)">
                <div>
                  <p className="text-sm font-bold text-(--color-text-primary)">{historyModal.title}</p>
                  <p className="text-xs text-(--color-text-secondary)">
                    Week of{' '}
                    {new Date(historyModal.weekStart).toLocaleDateString('en', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setHistoryModal(null)}
                  className="p-1.5 rounded-lg text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
                >
                  <IconX size={16} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {historyLbLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <IconLoader2 size={22} className="animate-spin text-(--color-text-secondary)" />
                  </div>
                ) : historyLeaderboard.length === 0 ? (
                  <p className="text-sm text-(--color-text-secondary) text-center py-8">
                    No participants recorded
                  </p>
                ) : (
                  <div className="divide-y divide-(--color-border)">
                    {historyLeaderboard.map((row) => (
                      <div
                        key={row.userId}
                        className={`flex items-center gap-3 px-5 py-3 ${
                          row.isCurrentUser ? 'bg-(--color-accent)/5' : ''
                        } ${row.isFriend ? 'bg-(--color-surface)' : ''}`}
                      >
                        <div className="w-7 flex justify-center shrink-0">
                          <RankMedal rank={row.rank} />
                        </div>
                        <Avatar name={row.name} avatarUrl={row.avatarUrl} size={30} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-(--color-text-primary) truncate">
                            {row.name}
                            {row.isCurrentUser && (
                              <span className="ml-1 text-xs text-(--color-accent)">(you)</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-(--color-text-primary) tabular-nums">
                            {row.problemsSolved}/{row.totalProblems}
                          </p>
                          {row.completed && (
                            <p className="text-xs text-amber-500">Badge earned</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Problem drawer ────────────────────────────────────────────────────── */}
      <ProblemDrawer
        problem={drawerProblem}
        onClose={() => setSelectedProblem(null)}
        onSolve={(problemId) => handleSolve(problemId)}
      />
    </div>
  )
}
