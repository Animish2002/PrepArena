import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  IconBolt,
  IconFlame,
  IconSun,
  IconMoon,
  IconBell,
  IconMenu2,
  IconCheck,
  IconLoader2,
  IconX,
  IconUserCheck,
} from '@tabler/icons-react'
import { useTheme } from '../../context/ThemeContext'
import { useProgressStore } from '../../store/progressStore'
import { useFriendStore, type PendingRequest } from '../../store/friendStore'
import { useFeedStore } from '../../store/feedStore'
import api from '../../lib/api'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/problems': 'Problems',
  '/friends': 'Friends',
  '/leaderboard': 'Leaderboard',
  '/battles': 'Battles',
  '/revisions': 'Revisions',
  '/profile': 'Profile',
  '/groups': 'Groups',
}

interface TopBarProps {
  onMenuToggle: () => void
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const stats = useProgressStore((s) => s.stats)
  const { pendingRequests, pendingCount, isLoaded, setPendingRequests, removePendingRequest } =
    useFriendStore()
  const addToast = useFeedStore((s) => s.addToast)

  const [notifOpen, setNotifOpen] = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoaded) return
    api
      .get<{ requests: PendingRequest[] }>('/api/friends/pending')
      .then((r) => setPendingRequests(r.data.requests))
      .catch(() => {})
  }, [isLoaded, setPendingRequests])

  useEffect(() => {
    if (!notifOpen) return
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [notifOpen])

  async function acceptRequest(friendshipId: string) {
    setActioningId(friendshipId)
    try {
      await api.post(`/api/friends/accept/${friendshipId}`)
      removePendingRequest(friendshipId)
      addToast('Friend request accepted!', 'success')
    } catch {
      addToast('Failed to accept request', 'info')
    } finally {
      setActioningId(null)
    }
  }

  async function declineRequest(friendshipId: string) {
    setActioningId(friendshipId)
    try {
      await api.post(`/api/friends/decline/${friendshipId}`)
      removePendingRequest(friendshipId)
    } catch {
      addToast('Failed to decline request', 'info')
    } finally {
      setActioningId(null)
    }
  }

  const title = PAGE_TITLES[pathname] ?? 'PrepArena'
  const weeklyXp = stats?.xp.weekly ?? 0
  const totalXp = stats?.xp.total ?? 0
  const visibleRequests = pendingRequests.slice(0, 5)

  return (
    <header className="h-14 flex items-center gap-2 px-4 border-b border-(--color-border) bg-(--color-surface) shrink-0">
      <button
        onClick={onMenuToggle}
        aria-label="Open menu"
        className="p-1.5 rounded-lg text-(--color-text-secondary) hover:bg-(--color-bg) hover:text-(--color-text-primary) transition-colors lg:hidden"
      >
        <IconMenu2 size={20} strokeWidth={1.75} />
      </button>

      <h1 className="text-sm font-semibold text-(--color-text-primary) flex-1">{title}</h1>

      {/* XP badge */}
      <div
        title={`${totalXp.toLocaleString()} total XP`}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold select-none cursor-default"
      >
        <IconBolt size={13} />
        <span>{weeklyXp > 0 ? `+${weeklyXp}` : totalXp.toLocaleString()}</span>
        <span className="opacity-60">{weeklyXp > 0 ? 'wk' : 'xp'}</span>
      </div>

      {/* Streak */}
      <div
        title="Current solve streak"
        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-semibold select-none cursor-default"
      >
        <IconFlame size={13} />
        <span>—</span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="p-1.5 rounded-lg text-(--color-text-secondary) hover:bg-(--color-bg) hover:text-(--color-text-primary) transition-colors"
      >
        {theme === 'dark' ? (
          <IconSun size={18} strokeWidth={1.75} />
        ) : (
          <IconMoon size={18} strokeWidth={1.75} />
        )}
      </button>

      {/* Bell + dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          aria-label="Notifications"
          className="relative p-1.5 rounded-lg text-(--color-text-secondary) hover:bg-(--color-bg) hover:text-(--color-text-primary) transition-colors"
        >
          <IconBell size={18} strokeWidth={1.75} />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border)">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--color-text-primary)">
                <IconUserCheck size={15} />
                Friend Requests
                {pendingCount > 0 && (
                  <span className="bg-red-500/15 text-red-500 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    {pendingCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setNotifOpen(false)}
                className="text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
              >
                <IconX size={14} />
              </button>
            </div>

            {visibleRequests.length === 0 ? (
              <p className="text-sm text-(--color-text-secondary) text-center py-8">
                No pending requests
              </p>
            ) : (
              <div className="divide-y divide-(--color-border)">
                {visibleRequests.map((req) => (
                  <div key={req.friendshipId} className="flex items-center gap-3 px-4 py-3">
                    {req.from.avatarUrl ? (
                      <img
                        src={req.from.avatarUrl}
                        alt={req.from.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-(--color-accent)/15 flex items-center justify-center text-(--color-accent) text-sm font-bold shrink-0">
                        {req.from.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-(--color-text-primary) truncate">
                        {req.from.name}
                      </p>
                      <p className="text-xs text-(--color-text-secondary)">@{req.from.username}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => acceptRequest(req.friendshipId)}
                        disabled={actioningId === req.friendshipId}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        title="Accept"
                      >
                        {actioningId === req.friendshipId ? (
                          <IconLoader2 size={13} className="animate-spin" />
                        ) : (
                          <IconCheck size={13} />
                        )}
                      </button>
                      <button
                        onClick={() => declineRequest(req.friendshipId)}
                        disabled={actioningId === req.friendshipId}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        title="Decline"
                      >
                        <IconX size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-(--color-border) px-4 py-2.5">
              <button
                onClick={() => {
                  setNotifOpen(false)
                  navigate('/friends?tab=requests')
                }}
                className="text-xs font-semibold text-(--color-accent) hover:underline"
              >
                {pendingCount > 5 ? `View all ${pendingCount} requests →` : 'View in Friends →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
