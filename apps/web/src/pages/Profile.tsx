import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import {
  IconCamera,
  IconEdit,
  IconCheck,
  IconX,
  IconClock,
  IconFlame,
  IconSwords,
  IconTrophy,
} from '@tabler/icons-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useAuthStore } from '../store/authStore'
import { useProgressStore } from '../store/progressStore'
import ProgressRing from '../components/ui/ProgressRing'
import api from '../lib/api'

interface ProfileStats {
  totalTimeSeconds: number
  rating: number
  battlesWon: number
  battlesLost: number
  currentStreak: number
  longestStreak: number
}

interface ActivityEntry {
  id: string
  type: string
  payload: string | null
  createdAt: number | null
}

function formatTime(s: number) {
  if (s < 3600) return `${Math.floor(s / 60)}m`
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function timeAgo(ts: number | null) {
  if (!ts) return ''
  const diff = Date.now() - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

function activityLabel(entry: ActivityEntry): string {
  let payload: Record<string, string> = {}
  try {
    if (entry.payload) payload = JSON.parse(entry.payload) as Record<string, string>
  } catch {}

  switch (entry.type) {
    case 'solved':
      return `Solved "${payload.title ?? 'a problem'}"`
    case 'attempted':
      return `Attempted "${payload.title ?? 'a problem'}"`
    case 'revision':
      return `Revised "${payload.title ?? 'a problem'}"`
    case 'battle_win':
      return 'Won a battle'
    case 'battle_loss':
      return 'Lost a battle'
    case 'friend_added':
      return `Added ${payload.name ?? 'a friend'}`
    default:
      return entry.type
  }
}

function AvatarDisplay({
  user,
  size,
}: {
  user: { name: string; avatarUrl?: string | null }
  size: number
}) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full bg-(--color-accent)/20 flex items-center justify-center text-(--color-accent) font-bold"
    >
      {user.name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function StatCard({
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
    <div className="bg-(--color-surface) border border-(--color-border) rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg ${color}/10 ${color.replace('text-', 'text-')} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-(--color-text-primary) tabular-nums">{value}</p>
      <p className="text-xs text-(--color-text-secondary) mt-0.5">{label}</p>
    </div>
  )
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse bg-(--color-border) rounded opacity-40 ${className}`} />
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuthStore()
  const { stats, fetchStats } = useProgressStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null)
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    fetchStats()
    Promise.all([
      api.get<ProfileStats>('/api/profile/stats'),
      api.get<{ entries: ActivityEntry[] }>('/api/profile/activity'),
    ])
      .then(([statsRes, activityRes]) => {
        setProfileStats(statsRes.data)
        setActivity(activityRes.data.entries)
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false))
  }, [fetchStats])

  function startEdit() {
    setEditName(user?.name ?? '')
    setEditUsername(user?.username ?? '')
    setSaveError('')
    setEditing(true)
  }

  async function saveProfile() {
    setSaving(true)
    setSaveError('')
    try {
      const { data } = await api.patch<{ user: { name: string; username: string; avatarUrl?: string | null } }>(
        '/api/profile',
        { name: editName, username: editUsername },
      )
      useAuthStore.setState((s) => ({
        user: s.user ? { ...s.user, ...data.user } : null,
      }))
      setEditing(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setSaveError(msg ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const baseUrl = (import.meta.env.VITE_API_URL as string) ?? ''
      const res = await fetch(`${baseUrl}/api/profile/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const { avatar_url } = (await res.json()) as { avatar_url: string }
      useAuthStore.setState((s) => ({
        user: s.user ? { ...s.user, avatarUrl: avatar_url } : null,
      }))
    } catch {
      // silently fail avatar upload
    } finally {
      setUploadingAvatar(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const accentColor =
    getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#6366f1'
  const borderColor =
    getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#e5e7eb'
  const textSecColor =
    getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim() ||
    '#6b7280'

  const radarData = (stats?.topicBreakdown ?? []).slice(0, 8).map((t) => ({
    topic: t.topic.length > 11 ? t.topic.slice(0, 9) + '…' : t.topic,
    confidence:
      t.avgConfidence != null
        ? Math.min(100, Math.round(((Number(t.avgConfidence) - 1) / 3) * 100))
        : 0,
  }))

  const readiness = stats?.interviewReadiness ?? 0
  const totalSolved = (stats?.solvedByDifficulty ?? []).reduce((s, d) => s + d.solved, 0)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-(--color-accent) border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8 pb-20 lg:pb-0">
      {/* ── Profile header ─────────────────────────────────────────────────────── */}
      <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {user && <AvatarDisplay user={user} size={80} />}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              title="Change avatar"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-(--color-surface) border border-(--color-border) flex items-center justify-center text-(--color-text-secondary) hover:text-(--color-accent) transition-colors shadow-sm disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <IconCamera size={14} />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name / username / edit */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Display name"
                  className="w-full text-sm rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40"
                />
                <div className="flex items-center gap-1 border border-(--color-border) rounded-lg overflow-hidden bg-(--color-bg)">
                  <span className="pl-3 text-sm text-(--color-text-secondary)">@</span>
                  <input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="username"
                    className="flex-1 text-sm px-1 py-1.5 text-(--color-text-primary) bg-transparent focus:outline-none"
                  />
                </div>
                {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-(--color-accent) text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <IconCheck size={12} />
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-xs text-(--color-text-secondary) hover:text-(--color-text-primary) px-2 py-1.5"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-(--color-text-primary)">{user?.name}</h1>
                  <p className="text-sm text-(--color-text-secondary)">@{user?.username}</p>
                  <p className="text-xs text-(--color-text-secondary) mt-1">{user?.email}</p>
                </div>
                <button
                  onClick={startEdit}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-(--color-text-secondary) hover:text-(--color-text-primary) px-2.5 py-1.5 rounded-lg border border-(--color-border) hover:bg-(--color-bg) transition-colors"
                >
                  <IconEdit size={13} />
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-(--color-surface) border border-(--color-border) rounded-xl p-4 space-y-3">
              <SkeletonBlock className="w-8 h-8 rounded-lg" />
              <SkeletonBlock className="h-6 w-16" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={<IconCheck size={18} />}
              label="Problems Solved"
              value={String(totalSolved)}
              color="text-emerald-500"
            />
            <StatCard
              icon={<IconClock size={18} />}
              label="Time Practiced"
              value={formatTime(profileStats?.totalTimeSeconds ?? 0)}
              color="text-blue-500"
            />
            <StatCard
              icon={<IconSwords size={18} />}
              label="Rating"
              value={String(profileStats?.rating ?? 1200)}
              color="text-(--color-accent)"
            />
            <StatCard
              icon={<IconFlame size={18} />}
              label="Current Streak"
              value={`${profileStats?.currentStreak ?? 0}d`}
              color="text-orange-500"
            />
          </>
        )}
      </div>

      {/* ── Interview Readiness + Radar ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readiness ring */}
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
          <h2 className="text-sm font-semibold text-(--color-text-primary) self-start">
            Interview Readiness
          </h2>
          <div className="relative">
            <ProgressRing
              percentage={readiness}
              size={152}
              strokeWidth={12}
              color={accentColor}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={readiness}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-black text-(--color-text-primary) tabular-nums"
              >
                {readiness}%
              </motion.span>
              <span className="text-xs text-(--color-text-secondary)">ready</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full text-center">
            <div className="p-2 rounded-xl bg-(--color-bg) border border-(--color-border)">
              <p className="text-sm font-bold text-(--color-text-primary)">{profileStats?.battlesWon ?? 0}</p>
              <p className="text-xs text-(--color-text-secondary)">Battles Won</p>
            </div>
            <div className="p-2 rounded-xl bg-(--color-bg) border border-(--color-border)">
              <p className="text-sm font-bold text-(--color-text-primary)">{profileStats?.longestStreak ?? 0}d</p>
              <p className="text-xs text-(--color-text-secondary)">Best Streak</p>
            </div>
          </div>
        </div>

        {/* Radar chart */}
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-(--color-text-primary) mb-2">
            Topic Confidence
          </h2>
          {radarData.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-sm text-(--color-text-secondary)">
              Solve problems to see your radar
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 4, right: 16, bottom: 4, left: 16 }}>
                <PolarGrid stroke={borderColor} />
                <PolarAngleAxis
                  dataKey="topic"
                  tick={{ fontSize: 10, fill: textSecColor }}
                />
                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'var(--color-text-primary)',
                  }}
                />
                <Radar
                  dataKey="confidence"
                  stroke={accentColor}
                  fill={accentColor}
                  fillOpacity={0.18}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent activity ─────────────────────────────────────────────────────── */}
      <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <IconTrophy size={16} className="text-(--color-accent)" />
          <h2 className="text-sm font-semibold text-(--color-text-primary)">Recent Activity</h2>
        </div>

        {loadingStats ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBlock className="w-2 h-2 rounded-full shrink-0" />
                <SkeletonBlock className="h-3 flex-1" />
                <SkeletonBlock className="h-3 w-12" />
              </div>
            ))}
          </div>
        ) : activity.length === 0 ? (
          <p className="text-sm text-(--color-text-secondary) text-center py-8">
            No activity yet — start solving!
          </p>
        ) : (
          <div className="relative pl-4 border-l border-(--color-border) space-y-4">
            {activity.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="relative"
              >
                <div className="absolute -left-5.25 top-1.5 w-2.5 h-2.5 rounded-full bg-(--color-border) border-2 border-(--color-surface)" />
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm text-(--color-text-primary)">{activityLabel(entry)}</p>
                  <span className="text-xs text-(--color-text-secondary) shrink-0 tabular-nums">
                    {timeAgo(entry.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
