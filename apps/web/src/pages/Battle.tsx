import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  IconSword,
  IconLoader2,
  IconClock,
  IconCheck,
  IconX,
  IconTrophy,
  IconRefresh,
} from '@tabler/icons-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Friend {
  id: string
  name: string
  username: string
  avatarUrl?: string | null
}

interface PendingBattle {
  id: string
  opponent?: { id: string; name: string; username: string; avatarUrl: string | null }
  challenger?: { id: string; name: string; username: string; avatarUrl: string | null }
}

interface HistoryEntry {
  id: string
  status: string
  won: number
  rating_delta: number | null
  opponent_id: string
  opponent_username: string
  opponent_avatar: string | null
  started_at: number | null
  ended_at: number | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Avatar({ name, avatarUrl, size = 36 }: { name: string; avatarUrl?: string | null; size?: number }) {
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BattlePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [friends, setFriends] = useState<Friend[]>([])
  const [pending, setPending] = useState<{ sent: PendingBattle[]; received: PendingBattle[] }>({
    sent: [],
    received: [],
  })
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const [loadingFriends, setLoadingFriends] = useState(true)
  const [loadingPending, setLoadingPending] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)

  const [challengingId, setChallengingId] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [decliningId, setDecliningId] = useState<string | null>(null)

  function loadPending() {
    setLoadingPending(true)
    api
      .get<{ sent: PendingBattle[]; received: PendingBattle[] }>('/api/battles/pending')
      .then((r) => setPending(r.data))
      .catch(() => {})
      .finally(() => setLoadingPending(false))
  }

  useEffect(() => {
    setLoadingFriends(true)
    api
      .get<{ friends: Friend[] }>('/api/friends')
      .then((r) => setFriends(r.data.friends))
      .catch(() => {})
      .finally(() => setLoadingFriends(false))

    loadPending()

    setLoadingHistory(true)
    api
      .get<{ history: HistoryEntry[] }>('/api/battles/history')
      .then((r) => setHistory(r.data.history))
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [])

  async function challenge(friendId: string) {
    setChallengingId(friendId)
    try {
      await api.post<{ battle_id: string }>('/api/battles/challenge', { opponent_id: friendId })
      loadPending()
    } catch {
      // ignore
    } finally {
      setChallengingId(null)
    }
  }

  async function accept(battleId: string) {
    setAcceptingId(battleId)
    try {
      await api.post(`/api/battles/${battleId}/accept`)
      navigate(`/battles/${battleId}`)
    } catch {
      setAcceptingId(null)
    }
  }

  async function decline(battleId: string) {
    setDecliningId(battleId)
    try {
      await api.post(`/api/battles/${battleId}/decline`)
      loadPending()
    } catch {
      // ignore
    } finally {
      setDecliningId(null)
    }
  }

  const sentBattleByFriendId = pending.sent.reduce<Record<string, PendingBattle>>((m, b) => {
    if (b.opponent) m[b.opponent.id] = b
    return m
  }, {})

  return (
    <div className="max-w-3xl space-y-8">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-(--color-text-primary) flex items-center gap-2">
          <IconSword size={20} className="text-(--color-accent)" />
          Battles
        </h1>
        <button
          onClick={loadPending}
          disabled={loadingPending}
          className="p-2 rounded-lg hover:bg-(--color-surface) text-(--color-text-secondary) transition-colors disabled:opacity-40"
          title="Refresh challenges"
        >
          <IconRefresh size={16} className={loadingPending ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Incoming challenges ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {pending.received.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex items-center gap-3 p-4 rounded-2xl border-2 border-(--color-accent)/40 bg-(--color-accent)/5"
          >
            <span className="text-xl shrink-0">⚔️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-(--color-text-primary)">
                {b.challenger?.name ?? 'Someone'} challenged you!
              </p>
              <p className="text-xs text-(--color-text-secondary)">@{b.challenger?.username}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => void accept(b.id)}
                disabled={acceptingId === b.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--color-accent) text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {acceptingId === b.id ? (
                  <IconLoader2 size={13} className="animate-spin" />
                ) : (
                  <IconCheck size={13} />
                )}
                Accept
              </button>
              <button
                onClick={() => void decline(b.id)}
                disabled={decliningId === b.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--color-border) text-(--color-text-secondary) text-xs font-semibold hover:bg-(--color-surface) transition-colors disabled:opacity-60"
              >
                {decliningId === b.id ? (
                  <IconLoader2 size={13} className="animate-spin" />
                ) : (
                  <IconX size={13} />
                )}
                Decline
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Challenge friends ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-(--color-text-primary) mb-3">Challenge a Friend</h2>

        {loadingFriends ? (
          <div className="flex justify-center py-10">
            <IconLoader2 size={22} className="animate-spin text-(--color-text-secondary)" />
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-10 bg-(--color-surface) border border-(--color-border) rounded-2xl">
            <p className="text-sm text-(--color-text-secondary)">
              Add friends first to challenge them
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {friends.map((friend) => {
              const pendingBattle = sentBattleByFriendId[friend.id]
              const isChallenging = challengingId === friend.id
              const isSelf = friend.id === user?.id
              return (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-4 bg-(--color-surface) border border-(--color-border) rounded-2xl hover:border-(--color-accent)/30 transition-colors"
                >
                  <Avatar name={friend.name} avatarUrl={friend.avatarUrl} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-(--color-text-primary) truncate">
                      {friend.name}
                    </p>
                    <p className="text-xs text-(--color-text-secondary) truncate">@{friend.username}</p>
                  </div>

                  {pendingBattle ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <motion.div
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--color-accent)/10 text-(--color-accent) text-xs font-semibold"
                      >
                        <IconClock size={13} />
                        Waiting…
                      </motion.div>
                    </div>
                  ) : (
                    <button
                      onClick={() => void challenge(friend.id)}
                      disabled={isChallenging || isSelf}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--color-accent) text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isChallenging ? (
                        <IconLoader2 size={13} className="animate-spin" />
                      ) : (
                        <IconSword size={13} />
                      )}
                      {isChallenging ? 'Sending…' : 'Challenge'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Battle history ───────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-(--color-text-primary) mb-3 flex items-center gap-2">
          <IconTrophy size={15} className="text-amber-500" />
          Battle History
        </h2>

        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <IconLoader2 size={20} className="animate-spin text-(--color-text-secondary)" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 bg-(--color-surface) border border-(--color-border) rounded-2xl">
            <p className="text-sm text-(--color-text-secondary)">No battles yet — challenge a friend!</p>
          </div>
        ) : (
          <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl overflow-hidden">
            {history.map((h, idx) => {
              const won = h.won === 1
              const delta = h.rating_delta ?? 0
              return (
                <div
                  key={h.id}
                  onClick={() => navigate(`/battles/${h.id}`)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-(--color-bg) transition-colors ${
                    idx < history.length - 1 ? 'border-b border-(--color-border)' : ''
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${
                      won ? 'bg-emerald-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    {won ? '🏆' : '💀'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-(--color-text-primary)">
                      vs @{h.opponent_username}
                    </p>
                    <p className="text-xs text-(--color-text-secondary)">
                      {timeAgo(h.ended_at ?? h.started_at)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold tabular-nums shrink-0 ${
                      delta >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {delta >= 0 ? '+' : ''}
                    {delta}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
