import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import api from '../../lib/api'
import { useFeedStore, type FeedEvent } from '../../store/feedStore'

function timeAgo(ts?: number | null): string {
  if (!ts) return ''
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function tryParse(s?: string | null): Record<string, string> {
  try {
    return JSON.parse(s ?? '{}') as Record<string, string>
  } catch {
    return {}
  }
}

function eventText(type: string, payload: Record<string, string>): string {
  switch (type) {
    case 'solved':
      return `solved "${payload.problem_title ?? 'a problem'}"`
    case 'battle_won':
      return 'won a battle ⚡'
    case 'battle_lost':
      return 'lost a battle'
    case 'battle_challenged':
    case 'battle_received':
      return 'sent a battle challenge'
    case 'revision':
      return 'completed a revision'
    default:
      return 'was active'
  }
}

function Avatar({ name, avatarUrl, size = 28 }: { name: string; avatarUrl?: string | null; size?: number }) {
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
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full bg-(--color-accent)/15 flex items-center justify-center text-(--color-accent) font-bold shrink-0 select-none"
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function ActivityFeed() {
  const [restEvents, setRestEvents] = useState<FeedEvent[]>([])
  const wsEvents = useFeedStore((s) => s.events)

  useEffect(() => {
    api
      .get<{ entries: FeedEvent[] }>('/api/feed')
      .then((r) => setRestEvents(r.data.entries.slice(0, 30)))
      .catch(() => {})
  }, [])

  const combined = useMemo(() => {
    const seen = new Set<string>()
    return [...wsEvents, ...restEvents]
      .filter((e) => {
        if (seen.has(e.id)) return false
        seen.add(e.id)
        return true
      })
      .slice(0, 20)
  }, [wsEvents, restEvents])

  if (combined.length === 0) {
    return (
      <p className="text-sm text-(--color-text-secondary) py-6 text-center">
        Add friends to see their activity
      </p>
    )
  }

  return (
    <div className="space-y-3.5">
      {combined.map((entry, i) => {
        const payload = tryParse(entry.payload)
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.18 }}
            className="flex items-start gap-2.5"
          >
            <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size={28} />
            <div className="min-w-0">
              <p className="text-xs text-(--color-text-primary) leading-snug">
                <span className="font-semibold">@{entry.username}</span>{' '}
                <span className="text-(--color-text-secondary)">{eventText(entry.type, payload)}</span>
              </p>
              <p className="text-xs text-(--color-text-secondary) mt-0.5 opacity-70">
                {timeAgo(entry.createdAt)}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
