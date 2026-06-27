import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconX, IconSword, IconFlame, IconBolt, IconCheck } from '@tabler/icons-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useProgressStore } from '../../store/progressStore'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

interface Friend {
  id: string
  name: string
  username: string
  avatarUrl?: string | null
  totalXp: number
  weeklyXp: number
  currentStreak: number
}

interface TopicProgress {
  topic: string
  total: number
  solved: number
  avgConfidence: number | null
}

interface FriendProgressModalProps {
  friend: Friend | null
  onClose: () => void
}

function InitialAvatar({ name, size = 48 }: { name: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full bg-(--color-accent)/15 flex items-center justify-center text-(--color-accent) font-bold shrink-0"
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function FriendProgressModal({ friend, onClose }: FriendProgressModalProps) {
  const { problems, userProgress } = useProgressStore()
  const navigate = useNavigate()
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([])
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [challenging, setChallenging] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!friend) return
    setTopicProgress([])
    setLoadingProgress(true)
    api
      .get<{ topicProgress: TopicProgress[] }>(`/api/friends/${friend.id}/progress`)
      .then((r) => setTopicProgress(r.data.topicProgress))
      .catch(() => {})
      .finally(() => setLoadingProgress(false))
  }, [friend?.id])

  // My topic completion %
  const myTopicStats = useMemo(() => {
    const map: Record<string, { total: number; solved: number }> = {}
    for (const p of problems) {
      if (!map[p.topic]) map[p.topic] = { total: 0, solved: 0 }
      map[p.topic].total++
      if (userProgress[p.id]?.status === 'solved') map[p.topic].solved++
    }
    return map
  }, [problems, userProgress])

  const chartData = useMemo(() => {
    return topicProgress.map((fp) => ({
      topic: fp.topic.length > 14 ? fp.topic.slice(0, 12) + '…' : fp.topic,
      You: fp.total > 0 ? Math.round(((myTopicStats[fp.topic]?.solved ?? 0) / fp.total) * 100) : 0,
      Friend: fp.total > 0 ? Math.round((fp.solved / fp.total) * 100) : 0,
    }))
  }, [topicProgress, myTopicStats])

  // Read CSS variable colors for recharts
  const accentColor =
    getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() ||
    '#6366f1'
  const textSecondaryColor =
    getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() ||
    '#6b7280'
  const borderColor =
    getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#e5e7eb'

  async function handleChallenge() {
    if (!friend) return
    setChallenging(true)
    try {
      await api.post('/api/battles/challenge', { opponent_id: friend.id })
      navigate('/battles')
      onClose()
    } catch {
      navigate('/battles')
      onClose()
    } finally {
      setChallenging(false)
    }
  }

  return (
    <AnimatePresence>
      {friend && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={backdropRef}
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onPointerDown={(e) => {
              if (e.target === backdropRef.current) onClose()
            }}
          >
            {/* Modal card */}
            <motion.div
              key="modal-card"
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-2xl bg-(--color-surface) rounded-2xl border border-(--color-border) shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 p-5 border-b border-(--color-border)">
                <div className="flex items-center gap-4">
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <InitialAvatar name={friend.name} size={48} />
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-(--color-text-primary)">{friend.name}</h2>
                    <p className="text-sm text-(--color-text-secondary)">@{friend.username}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-(--color-bg) text-(--color-text-secondary) transition-colors shrink-0"
                >
                  <IconX size={18} />
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-(--color-border) border-b border-(--color-border)">
                <StatCell icon={<IconCheck size={14} />} label="Weekly XP" value={friend.weeklyXp.toLocaleString()} color="text-(--color-accent)" />
                <StatCell icon={<IconFlame size={14} />} label="Streak" value={`${friend.currentStreak}d`} color="text-orange-500" />
                <StatCell icon={<IconBolt size={14} />} label="Total XP" value={friend.totalXp.toLocaleString()} color="text-amber-500" />
              </div>

              {/* Chart */}
              <div className="flex-1 overflow-y-auto p-5">
                <h3 className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wider mb-4">
                  Topic Completion — You vs {friend.name.split(' ')[0]}
                </h3>

                {loadingProgress ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-6 h-6 border-2 border-(--color-accent) border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-sm text-(--color-text-secondary)">No progress data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 4, right: 8, left: -16, bottom: 48 }}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={borderColor} vertical={false} />
                      <XAxis
                        dataKey="topic"
                        tick={{ fontSize: 10, fill: textSecondaryColor }}
                        angle={-40}
                        textAnchor="end"
                        interval={0}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        unit="%"
                        tick={{ fontSize: 10, fill: textSecondaryColor }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, undefined]}
                        contentStyle={{
                          background: 'var(--color-surface)',
                          border: `1px solid ${borderColor}`,
                          borderRadius: 8,
                          fontSize: 12,
                          color: 'var(--color-text-primary)',
                        }}
                        cursor={{ fill: borderColor, opacity: 0.3 }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Bar dataKey="You" fill={accentColor} radius={[3, 3, 0, 0]} maxBarSize={20} />
                      <Bar dataKey="Friend" fill={textSecondaryColor} radius={[3, 3, 0, 0]} maxBarSize={20} opacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-(--color-border)">
                <button
                  onClick={handleChallenge}
                  disabled={challenging}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-(--color-accent) text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <IconSword size={16} />
                  {challenging ? 'Creating challenge…' : `Challenge ${friend.name.split(' ')[0]} to Battle`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function StatCell({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center py-3 gap-0.5">
      <div className={`flex items-center gap-1 ${color} mb-0.5`}>{icon}</div>
      <p className="text-base font-bold text-(--color-text-primary) tabular-nums">{value}</p>
      <p className="text-xs text-(--color-text-secondary)">{label}</p>
    </div>
  )
}
