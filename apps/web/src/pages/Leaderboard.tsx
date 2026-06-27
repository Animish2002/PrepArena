import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { IconBolt, IconFlame, IconChevronDown, IconLoader2, IconTrophy } from '@tabler/icons-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

type Period = 'weekly' | 'monthly' | 'alltime'

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  username: string
  avatarUrl?: string | null
  xp: number
  solved: number
  streak: number
  isCurrentUser: boolean
}

interface TopicEntry {
  user: {
    id: string
    name: string
    username: string
    avatarUrl?: string | null
    isCurrentUser: boolean
  }
  avgConfidence: number
  solved: number
}

// Animate a number from 0 to its final value
function CountUp({ to, delay = 0 }: { to: number; delay?: number }) {
  const [val, setVal] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const timeout = setTimeout(() => {
      const steps = 24
      const duration = 500
      const increment = to / steps
      let i = 0
      const id = setInterval(() => {
        i++
        setVal(Math.round(Math.min(increment * i, to)))
        if (i >= steps) clearInterval(id)
      }, duration / steps)
      return () => clearInterval(id)
    }, delay)
    return () => clearTimeout(timeout)
  }, [to, delay])

  return <>{val.toLocaleString()}</>
}

function InitialAvatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full bg-(--color-accent)/15 flex items-center justify-center text-(--color-accent) font-bold shrink-0 select-none"
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

const PERIOD_LABELS: Record<Period, string> = {
  weekly: 'This Week',
  monthly: 'This Month',
  alltime: 'All Time',
}

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [period, setPeriod] = useState<Period>('weekly')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const [topicData, setTopicData] = useState<Record<string, TopicEntry[]>>({})
  const [topicLoading, setTopicLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .get<{ leaderboard: LeaderboardEntry[] }>(`/api/leaderboard/friends?period=${period}`)
      .then((r) => setLeaderboard(r.data.leaderboard))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  useEffect(() => {
    setTopicLoading(true)
    api
      .get<{ topics: Record<string, TopicEntry[]> }>('/api/leaderboard/topics')
      .then((r) => {
        setTopicData(r.data.topics)
        const keys = Object.keys(r.data.topics).sort()
        if (keys.length > 0) setSelectedTopic(keys[0])
      })
      .catch(() => {})
      .finally(() => setTopicLoading(false))
  }, [])

  const topicKeys = useMemo(() => Object.keys(topicData).sort(), [topicData])
  const topicRankings = selectedTopic ? (topicData[selectedTopic] ?? []) : []

  return (
    <div className="max-w-3xl space-y-8">
      {/* ── XP Leaderboard ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-(--color-text-primary) flex items-center gap-2">
            <IconTrophy size={20} className="text-amber-500" />
            Friends Leaderboard
          </h1>

          {/* Period tabs */}
          <div className="flex bg-(--color-surface) border border-(--color-border) rounded-xl p-1 gap-0.5">
            {(['weekly', 'monthly', 'alltime'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  period === p
                    ? 'bg-(--color-accent) text-white shadow-sm'
                    : 'text-(--color-text-secondary) hover:text-(--color-text-primary)'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <IconLoader2 size={24} className="animate-spin text-(--color-text-secondary)" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-(--color-text-secondary) text-sm">
                Add friends to see the leaderboard
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--color-border)">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-(--color-text-secondary) w-12">
                    Rank
                  </th>
                  <th className="text-left px-2 py-3 text-xs font-semibold text-(--color-text-secondary)">
                    Player
                  </th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-(--color-text-secondary) hidden sm:table-cell">
                    XP
                  </th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-(--color-text-secondary) hidden sm:table-cell">
                    Solved
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-(--color-text-secondary) hidden md:table-cell">
                    Streak
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    className={`border-b border-(--color-border) last:border-0 ${
                      entry.isCurrentUser
                        ? 'bg-(--color-accent)/6 ring-1 ring-inset ring-(--color-accent)/30'
                        : 'hover:bg-(--color-bg)'
                    } transition-colors`}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3">
                      <span className="text-base">
                        {RANK_MEDAL[entry.rank] ?? (
                          <span className="text-sm font-bold text-(--color-text-secondary) tabular-nums">
                            {entry.rank}
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Player */}
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2.5">
                        {entry.avatarUrl ? (
                          <img
                            src={entry.avatarUrl}
                            alt={entry.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <InitialAvatar name={entry.name} size={32} />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-(--color-text-primary) truncate text-sm leading-tight">
                            {entry.name}
                            {entry.isCurrentUser && (
                              <span className="ml-1.5 text-xs font-normal text-(--color-accent)">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-(--color-text-secondary) truncate">
                            @{entry.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* XP */}
                    <td className="px-2 py-3 text-right hidden sm:table-cell">
                      <span className="flex items-center justify-end gap-1 text-amber-500 font-bold tabular-nums text-sm">
                        <IconBolt size={13} />
                        <CountUp to={entry.xp} delay={idx * 40} />
                      </span>
                    </td>

                    {/* Solved */}
                    <td className="px-2 py-3 text-right hidden sm:table-cell">
                      <span className="text-(--color-text-primary) font-semibold tabular-nums text-sm">
                        <CountUp to={entry.solved} delay={idx * 40 + 80} />
                      </span>
                    </td>

                    {/* Streak */}
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="flex items-center justify-end gap-1 text-orange-500 font-semibold tabular-nums text-sm">
                        <IconFlame size={13} />
                        {entry.streak}d
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Topic Leaderboard ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-(--color-text-primary)">Topic Leaderboard</h2>

          {/* Topic selector */}
          {topicKeys.length > 0 && (
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-xs rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40 cursor-pointer"
              >
                {topicKeys.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <IconChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-text-secondary) pointer-events-none"
              />
            </div>
          )}
        </div>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl overflow-hidden">
          {topicLoading ? (
            <div className="flex items-center justify-center py-12">
              <IconLoader2 size={22} className="animate-spin text-(--color-text-secondary)" />
            </div>
          ) : topicRankings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-(--color-text-secondary)">
                {selectedTopic
                  ? `No data yet for ${selectedTopic}`
                  : 'No topic data — solve some problems first'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--color-border)">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-(--color-text-secondary) w-12">
                    Rank
                  </th>
                  <th className="text-left px-2 py-3 text-xs font-semibold text-(--color-text-secondary)">
                    Player
                  </th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-(--color-text-secondary)">
                    Solved
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-(--color-text-secondary)">
                    Avg Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {topicRankings.map((entry, idx) => {
                  const isMe = entry.user.id === user?.id
                  const conf = entry.avgConfidence
                  const confLabel =
                    conf >= 3.5 ? '🚀 Mastered' : conf >= 2.5 ? '👍 Got it' : conf >= 1.5 ? '🤔 Revision' : '😕 Learning'
                  return (
                    <tr
                      key={entry.user.id}
                      className={`border-b border-(--color-border) last:border-0 ${
                        isMe
                          ? 'bg-(--color-accent)/6 ring-1 ring-inset ring-(--color-accent)/30'
                          : 'hover:bg-(--color-bg)'
                      } transition-colors`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-base">
                          {RANK_MEDAL[idx + 1] ?? (
                            <span className="text-sm font-bold text-(--color-text-secondary) tabular-nums">
                              {idx + 1}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2.5">
                          {entry.user.avatarUrl ? (
                            <img
                              src={entry.user.avatarUrl}
                              alt={entry.user.name ?? ''}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <InitialAvatar name={entry.user.name ?? '?'} size={32} />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-(--color-text-primary) truncate text-sm">
                              {entry.user.name}
                              {isMe && (
                                <span className="ml-1.5 text-xs font-normal text-(--color-accent)">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-(--color-text-secondary)">
                              @{entry.user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <span className="font-bold text-(--color-text-primary) tabular-nums">
                          {entry.solved}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-medium text-(--color-text-secondary)">
                          {confLabel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
