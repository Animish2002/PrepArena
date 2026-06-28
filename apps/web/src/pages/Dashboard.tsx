import { useEffect, useState } from 'react'
import { IconCheck, IconFlame, IconBolt, IconCalendar } from '@tabler/icons-react'
import { useProgressStore } from '../store/progressStore'
import api from '../lib/api'
import ActivityFeed from '../components/feed/ActivityFeed'

interface Revision {
  id: string
  problemId: string
  title: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  dueDate: number
}

interface DailyMission {
  easy: boolean
  medium: boolean
  revision: boolean
  allDone: boolean
  xpReward: number
}

const DIFF_BADGE: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-500',
  medium: 'bg-amber-500/10 text-amber-500',
  hard: 'bg-red-500/10 text-red-500',
}

function computeCurrentStreak(activeDates: string[]): number {
  if (activeDates.length === 0) return 0
  const dateSet = new Set(activeDates)
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (dateSet.has(d.toISOString().slice(0, 10))) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function StreakCalendar({ activeDates }: { activeDates: string[] }) {
  const dateSet = new Set(activeDates)
  const today = new Date()
  const cells = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (29 - i))
    const str = d.toISOString().slice(0, 10)
    return { date: str, active: dateSet.has(str), isToday: i === 29 }
  })

  return (
    <div className="grid grid-cols-10 gap-1.5">
      {cells.map(({ date, active, isToday }) => (
        <div
          key={date}
          title={date}
          className={[
            'h-6 rounded-md transition-colors',
            active
              ? 'bg-emerald-500'
              : isToday
                ? 'dark:bg-white/15 bg-black/15 ring-2 ring-(--color-accent)/60'
                : 'dark:bg-white/8 bg-black/8',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

function MissionTask({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={[
          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0',
          done ? 'border-emerald-500 bg-emerald-500' : 'border-(--color-border) bg-(--color-bg)',
        ].join(' ')}
      >
        {done && <IconCheck size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span
        className={[
          'text-sm transition-colors',
          done ? 'line-through text-(--color-text-secondary)' : 'text-(--color-text-primary)',
        ].join(' ')}
      >
        {label}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { stats, fetchStats } = useProgressStore()
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [revisionCount, setRevisionCount] = useState(0)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [activeDates, setActiveDates] = useState<string[]>([])
  const [mission, setMission] = useState<DailyMission | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    fetchStats()
    api
      .get<{ revisions: Revision[]; count: number }>('/api/progress/revisions/today')
      .then((r) => {
        setRevisions(r.data.revisions)
        setRevisionCount(r.data.count)
      })
      .catch(() => {})

    api
      .get<{ activeDates: string[] }>('/api/progress/activity-streak')
      .then((r) => {
        setActiveDates(r.data.activeDates)
        setStreak(computeCurrentStreak(r.data.activeDates))
      })
      .catch(() => setActiveDates([]))

    api
      .get<DailyMission>('/api/progress/daily-mission')
      .then((r) => setMission(r.data))
      .catch(() => setMission({ easy: false, medium: false, revision: false, allDone: false, xpReward: 150 }))
  }, [fetchStats])

  const totalSolved = stats?.solvedByDifficulty.reduce((s, d) => s + d.solved, 0) ?? 0
  const totalProblems = stats?.totalByDifficulty.reduce((s, d) => s + d.total, 0) ?? 0
  const completePct = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0

  async function completeRevision(id: string) {
    setCompletingId(id)
    try {
      await api.post(`/api/progress/revisions/${id}/complete`)
      setRevisions((rs) => rs.filter((r) => r.id !== id))
      setRevisionCount((n) => Math.max(0, n - 1))
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl pb-20 lg:pb-0">
      {/* ── Stat cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Problems Solved"
          value={`${totalSolved} / ${totalProblems}`}
          sub={`${completePct}% complete`}
          icon={<IconCheck size={18} strokeWidth={2} />}
          color="emerald"
        />
        <StatCard
          label="Current Streak"
          value={streak > 0 ? `${streak}` : '—'}
          sub="days in a row"
          icon={<IconFlame size={18} strokeWidth={2} />}
          color="orange"
        />
        <StatCard
          label="Weekly XP"
          value={(stats?.xp.weekly ?? 0).toLocaleString()}
          sub={`${(stats?.xp.total ?? 0).toLocaleString()} total`}
          icon={<IconBolt size={18} strokeWidth={2} />}
          color="amber"
        />
        <StatCard
          label="Revisions Due"
          value={revisionCount}
          sub="due today"
          icon={<IconCalendar size={18} strokeWidth={2} />}
          color="violet"
        />
      </div>

      {/* ── Daily Mission + Streak calendar ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-(--color-surface) border border-(--color-border) rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-(--color-text-primary) flex items-center gap-2">
              <span className="text-base">🎯</span>
              Today's Mission
            </h2>
            <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
              +{mission?.xpReward ?? 150} XP
            </span>
          </div>
          {mission ? (
            <div className="space-y-3">
              <MissionTask label="Solve 1 Easy problem" done={mission.easy} />
              <MissionTask label="Solve 1 Medium problem" done={mission.medium} />
              <MissionTask label="Complete 1 Revision" done={mission.revision} />
              {mission.allDone && (
                <p className="text-xs text-emerald-500 font-semibold pt-1">
                  ✓ Mission complete — XP awarded!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-(--color-border) opacity-40 shrink-0" />
                  <div className="h-4 bg-(--color-border) rounded w-40 opacity-40" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-(--color-text-primary)">
              Activity — Last 30 Days
            </h2>
            <span className="text-xs text-(--color-text-secondary)">
              {activeDates.length} active days
            </span>
          </div>
          <StreakCalendar activeDates={activeDates} />
          <p className="text-xs text-(--color-text-secondary) mt-2">
            {streak > 0
              ? `${streak} day${streak !== 1 ? 's' : ''} current streak`
              : 'Start solving to build your streak'}
          </p>
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-(--color-surface) border border-(--color-border) rounded-xl p-5">
          <h2 className="text-sm font-semibold text-(--color-text-primary) mb-4">Topic Progress</h2>
          {stats && stats.topicBreakdown.length > 0 ? (
            <div className="space-y-3">
              {stats.topicBreakdown.map((t) => {
                const pct = t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0
                return (
                  <div key={t.topic}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-(--color-text-primary) font-medium truncate">{t.topic}</span>
                      <span className="text-(--color-text-secondary) ml-3 shrink-0 tabular-nums">
                        {t.solved}/{t.total}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-(--color-bg)">
                      <div
                        className="h-full rounded-full bg-(--color-accent) transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-(--color-text-secondary) py-6 text-center">
              Start solving problems to see your progress here
            </p>
          )}
        </div>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-xl p-5">
          <h2 className="text-sm font-semibold text-(--color-text-primary) mb-4">Friend Activity</h2>
          <ActivityFeed />
        </div>
      </div>

      {/* ── Revisions due today ──────────────────────────────────────────────── */}
      {revisions.length > 0 && (
        <div className="bg-(--color-surface) border border-(--color-border) rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-(--color-text-primary)">Today's Revisions</h2>
            <span className="text-xs text-(--color-text-secondary) bg-(--color-bg) px-2 py-0.5 rounded-full">
              {revisions.length} pending
            </span>
          </div>
          <div className="space-y-2">
            {revisions.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-(--color-bg) border border-(--color-border)"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${DIFF_BADGE[rev.difficulty] ?? ''}`}
                  >
                    {rev.difficulty[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-(--color-text-primary) truncate">{rev.title}</p>
                    <p className="text-xs text-(--color-text-secondary)">{rev.topic}</p>
                  </div>
                </div>
                <button
                  onClick={() => completeRevision(rev.id)}
                  disabled={completingId === rev.id}
                  className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-(--color-accent)/10 text-(--color-accent) hover:bg-(--color-accent)/20 transition-colors disabled:opacity-50"
                >
                  {completingId === rev.id ? '…' : 'Done'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

type Color = 'emerald' | 'orange' | 'amber' | 'violet'

const COLOR_MAP: Record<Color, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500' },
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string
  value: string | number
  sub: string
  icon: React.ReactNode
  color: Color
}) {
  const { bg, text } = COLOR_MAP[color]
  return (
    <div className="bg-(--color-surface) border border-(--color-border) rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg ${bg} ${text} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-(--color-text-primary) tabular-nums">{value}</p>
      <p className="text-xs font-medium text-(--color-text-secondary) mt-0.5">{label}</p>
      <p className="text-xs text-(--color-text-secondary) mt-1 opacity-70">{sub}</p>
    </div>
  )
}
