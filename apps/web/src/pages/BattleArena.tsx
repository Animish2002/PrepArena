import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import confetti from 'canvas-confetti'
import {
  IconExternalLink,
  IconCheck,
  IconLoader2,
  IconSword,
  IconClock,
  IconWifi,
  IconWifiOff,
} from '@tabler/icons-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useBattleWebSocket } from '../hooks/useBattleWebSocket'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BattleUser {
  id: string
  name: string
  username: string
  avatarUrl?: string | null
}

interface BattleProblem {
  id: string
  title: string
  difficulty: string | null
  platform: string | null
  platformLink: string | null
}

interface BattleDetail {
  id: string
  status: 'pending' | 'active' | 'completed'
  challenger: BattleUser
  opponent: BattleUser
  problems: BattleProblem[]
  startedAt: number | null
  endedAt: number | null
  winnerId: string | null
  challengerRatingDelta: number | null
  opponentRatingDelta: number | null
  iAmChallenger: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BATTLE_DURATION_MS = 45 * 60 * 1000

const DIFF_BADGE: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-600',
  medium: 'bg-amber-500/10 text-amber-600',
  hard: 'bg-red-500/10 text-red-600',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(ms: number): string {
  const secs = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function Avatar({ user, size = 36 }: { user: BattleUser; size?: number }) {
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
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full bg-(--color-accent)/15 flex items-center justify-center text-(--color-accent) font-bold select-none"
    >
      {user.name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

// ── Arena screen ──────────────────────────────────────────────────────────────

function ArenaScreen({
  battle,
  myUser,
  theirUser,
  myScore,
  theirScore,
  mySolvedSet,
  theirSolvedSet,
  battleStatus,
  onSolve,
}: {
  battle: BattleDetail
  myUser: BattleUser
  theirUser: BattleUser
  myScore: number
  theirScore: number
  mySolvedSet: Set<number>
  theirSolvedSet: Set<number>
  battleStatus: string
  onSolve: (idx: number) => void
}) {
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION_MS)
  const [openedIdx, setOpenedIdx] = useState<number | null>(null)

  useEffect(() => {
    if (!battle.startedAt) return
    const update = () => {
      const elapsed = Date.now() - battle.startedAt!
      setTimeLeft(Math.max(0, BATTLE_DURATION_MS - elapsed))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [battle.startedAt])

  const isLow = timeLeft < 5 * 60 * 1000

  function openProblem(idx: number, link: string | null) {
    if (link) window.open(link, '_blank', 'noopener,noreferrer')
    setOpenedIdx(idx)
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Battle header ──────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-(--color-surface) border-b border-(--color-border) px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Players */}
          <div className="flex items-center gap-3 min-w-0">
            <Avatar user={myUser} size={32} />
            <span className="font-bold text-(--color-text-primary) text-sm truncate hidden sm:block">
              {myUser.name.split(' ')[0]}
            </span>
            <span className="text-(--color-text-secondary) text-xs">vs</span>
            <Avatar user={theirUser} size={32} />
            <span className="font-bold text-(--color-text-primary) text-sm truncate hidden sm:block">
              {theirUser.name.split(' ')[0]}
            </span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 font-mono font-bold text-lg tabular-nums ${isLow ? 'text-red-500' : 'text-(--color-text-primary)'}`}>
            <IconClock size={18} className={isLow ? 'text-red-500' : 'text-(--color-text-secondary)'} />
            {formatTime(timeLeft)}
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-1 text-xs text-(--color-text-secondary) shrink-0">
            {battleStatus === 'connecting' ? (
              <>
                <IconWifiOff size={13} className="text-red-400 animate-pulse" />
                <span className="hidden sm:inline">Reconnecting</span>
              </>
            ) : (
              <>
                <IconWifi size={13} className="text-emerald-500" />
                <span className="hidden sm:inline">Live</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 flex flex-col lg:flex-row gap-4">
          {/* ── Problem cards ─────────────────────────────────────────────── */}
          <div className="flex-1 space-y-3">
            {battle.problems.map((p, idx) => {
              const iSolved = mySolvedSet.has(idx)
              const theySolved = theirSolvedSet.has(idx)
              const wasOpened = openedIdx === idx

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`p-4 rounded-2xl border transition-colors ${
                    iSolved
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-(--color-surface) border-(--color-border)'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Problem number */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        iSolved
                          ? 'bg-emerald-500 text-white'
                          : 'bg-(--color-bg) text-(--color-text-secondary)'
                      }`}
                    >
                      {iSolved ? <IconCheck size={13} /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-(--color-text-primary) leading-snug">
                        {p.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {p.difficulty && (
                          <span
                            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${DIFF_BADGE[p.difficulty] ?? ''}`}
                          >
                            {p.difficulty[0].toUpperCase() + p.difficulty.slice(1)}
                          </span>
                        )}
                        {theySolved && !iSolved && (
                          <span className="text-xs text-amber-500 font-medium">Opponent solved ✓</span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 flex flex-col gap-2 items-end">
                      {!iSolved && (
                        <button
                          onClick={() => openProblem(idx, p.platformLink)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--color-accent) text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          <IconExternalLink size={13} />
                          Open
                        </button>
                      )}
                      {wasOpened && !iSolved && (
                        <button
                          onClick={() => onSolve(idx)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                        >
                          <IconCheck size={13} />
                          Solved!
                        </button>
                      )}
                      {iSolved && (
                        <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                          <IconCheck size={13} /> Done
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ── Score panel ─────────────────────────────────────────────────── */}
          <div className="lg:w-48 shrink-0">
            <div className="sticky top-4 bg-(--color-surface) border border-(--color-border) rounded-2xl p-4">
              <p className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wider mb-4 text-center">
                Score
              </p>

              <div className="space-y-3">
                <ScoreRow user={myUser} score={myScore} isMe />
                <div className="text-center text-xs text-(--color-text-secondary) font-bold">vs</div>
                <ScoreRow user={theirUser} score={theirScore} />
              </div>

              <div className="mt-4 pt-3 border-t border-(--color-border) text-center">
                <p className="text-xs text-(--color-text-secondary)">
                  {5 - mySolvedSet.size} left
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreRow({ user, score, isMe }: { user: BattleUser; score: number; isMe?: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-xl ${isMe ? 'bg-(--color-accent)/8' : ''}`}>
      <Avatar user={user} size={28} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-(--color-text-primary) truncate">
          {isMe ? 'You' : user.name.split(' ')[0]}
        </p>
      </div>
      <span className="text-xl font-bold tabular-nums text-(--color-text-primary)">{score}</span>
    </div>
  )
}

// ── Result screen ─────────────────────────────────────────────────────────────

function ResultScreen({
  battle,
  myUser,
  theirUser,
  myScore,
  theirScore,
  winnerId,
  ratingDelta,
  onRematch,
}: {
  battle: BattleDetail
  myUser: BattleUser
  theirUser: BattleUser
  myScore: number
  theirScore: number
  winnerId: string | null
  ratingDelta: number
  onRematch: () => void
}) {
  const navigate = useNavigate()
  const confettiFired = useRef(false)
  const iWon = winnerId === myUser.id
  const isTie = winnerId === null

  useEffect(() => {
    if (confettiFired.current || !iWon) return
    confettiFired.current = true
    void confetti({ particleCount: 150, spread: 80, origin: { y: 0.55 } })
    setTimeout(() => void confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } }), 250)
    setTimeout(() => void confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } }), 400)
  }, [iWon])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 text-center shadow-xl"
      >
        {/* Result emoji */}
        <div className="text-6xl mb-3">
          {isTie ? '🤝' : iWon ? '🏆' : '💀'}
        </div>

        <h2 className="text-2xl font-bold text-(--color-text-primary) mb-1">
          {isTie ? "It's a Tie!" : iWon ? 'You Won!' : 'Better Luck Next Time'}
        </h2>
        <p className="text-sm text-(--color-text-secondary) mb-5">
          {isTie
            ? 'A perfectly matched battle.'
            : iWon
            ? `You defeated @${theirUser.username}!`
            : `@${theirUser.username} beat you this time.`}
        </p>

        {/* Rating badge */}
        {ratingDelta !== 0 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold mb-5 ${
              ratingDelta > 0
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-red-500/10 text-red-600'
            }`}
          >
            {ratingDelta > 0 ? '+' : ''}
            {ratingDelta} Rating
          </motion.div>
        )}

        {/* Score summary */}
        <div className="flex items-center justify-center gap-6 p-4 bg-(--color-bg) rounded-xl mb-6">
          <div className="text-center">
            <Avatar user={myUser} size={36} />
            <p className="text-xs text-(--color-text-secondary) mt-1">You</p>
            <p className="text-2xl font-bold text-(--color-text-primary) tabular-nums">{myScore}</p>
          </div>
          <div className="text-sm text-(--color-text-secondary) font-bold">vs</div>
          <div className="text-center">
            <Avatar user={theirUser} size={36} />
            <p className="text-xs text-(--color-text-secondary) mt-1">{theirUser.name.split(' ')[0]}</p>
            <p className="text-2xl font-bold text-(--color-text-primary) tabular-nums">{theirScore}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/battles')}
            className="flex-1 py-2.5 rounded-xl border border-(--color-border) text-sm text-(--color-text-secondary) font-semibold hover:bg-(--color-bg) transition-colors"
          >
            Back to Battles
          </button>
          <button
            onClick={onRematch}
            className="flex-1 py-2.5 rounded-xl bg-(--color-accent) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Rematch
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BattleArena() {
  const { id: battleId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [battle, setBattle] = useState<BattleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { scores, solves, battleStatus, winnerId, sendSolved } = useBattleWebSocket(
    battleId ?? '',
  )

  useEffect(() => {
    if (!battleId) return
    setLoading(true)
    api
      .get<BattleDetail>(`/api/battles/${battleId}`)
      .then((r) => setBattle(r.data))
      .catch(() => setError('Battle not found'))
      .finally(() => setLoading(false))
  }, [battleId])

  const myUser = battle
    ? battle.iAmChallenger
      ? battle.challenger
      : battle.opponent
    : null
  const theirUser = battle
    ? battle.iAmChallenger
      ? battle.opponent
      : battle.challenger
    : null

  const myScore = myUser ? (scores[myUser.id] ?? 0) : 0
  const theirScore = theirUser ? (scores[theirUser.id] ?? 0) : 0

  const mySolvedSet = useMemo(
    () => new Set(solves.filter((s) => s.userId === myUser?.id).map((s) => s.problemIndex)),
    [solves, myUser?.id],
  )
  const theirSolvedSet = useMemo(
    () => new Set(solves.filter((s) => s.userId === theirUser?.id).map((s) => s.problemIndex)),
    [solves, theirUser?.id],
  )

  const effectiveWinnerId = winnerId ?? (battleStatus === 'completed' ? battle?.winnerId ?? null : null)
  const ratingDelta = battle
    ? battle.iAmChallenger
      ? (battle.challengerRatingDelta ?? 0)
      : (battle.opponentRatingDelta ?? 0)
    : 0

  function handleSolve(idx: number) {
    sendSolved(idx)
  }

  async function handleRematch() {
    if (!theirUser) return
    try {
      const r = await api.post<{ battle_id: string }>('/api/battles/challenge', {
        opponent_id: theirUser.id,
      })
      navigate(`/battles/${r.data.battle_id}`)
    } catch {
      navigate('/battles')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader2 size={28} className="animate-spin text-(--color-text-secondary)" />
      </div>
    )
  }

  if (error || !battle || !myUser || !theirUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-(--color-text-secondary)">{error || 'Battle not found'}</p>
        <button
          onClick={() => navigate('/battles')}
          className="px-4 py-2 rounded-xl bg-(--color-accent) text-white text-sm font-semibold"
        >
          Back to Battles
        </button>
      </div>
    )
  }

  // Completed from REST (navigated to a finished battle directly)
  const isCompleted = battleStatus === 'completed' || battle.status === 'completed'
  const iAmInvolved = user?.id === myUser.id

  if (isCompleted && iAmInvolved) {
    return (
      <ResultScreen
        battle={battle}
        myUser={myUser}
        theirUser={theirUser}
        myScore={myScore}
        theirScore={theirScore}
        winnerId={effectiveWinnerId}
        ratingDelta={ratingDelta}
        onRematch={handleRematch}
      />
    )
  }

  if (battle.status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-5xl">⚔️</div>
        <h2 className="text-lg font-bold text-(--color-text-primary)">Waiting for opponent</h2>
        <p className="text-sm text-(--color-text-secondary)">
          @{theirUser.username} hasn't accepted yet
        </p>
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="flex items-center gap-2 text-(--color-accent) text-sm font-medium"
        >
          <IconSword size={16} />
          Waiting for acceptance…
        </motion.div>
        <button
          onClick={() => navigate('/battles')}
          className="mt-2 px-4 py-2 rounded-xl border border-(--color-border) text-(--color-text-secondary) text-sm hover:bg-(--color-surface) transition-colors"
        >
          Back
        </button>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {isCompleted ? (
        <ResultScreen
          key="result"
          battle={battle}
          myUser={myUser}
          theirUser={theirUser}
          myScore={myScore}
          theirScore={theirScore}
          winnerId={effectiveWinnerId}
          ratingDelta={ratingDelta}
          onRematch={handleRematch}
        />
      ) : (
        <motion.div
          key="arena"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full flex flex-col"
        >
          <ArenaScreen
            battle={battle}
            myUser={myUser}
            theirUser={theirUser}
            myScore={myScore}
            theirScore={theirScore}
            mySolvedSet={mySolvedSet}
            theirSolvedSet={theirSolvedSet}
            battleStatus={battleStatus}
            onSolve={handleSolve}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
