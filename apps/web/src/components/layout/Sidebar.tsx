import { NavLink } from 'react-router-dom'
import {
  IconLayoutDashboard,
  IconCode,
  IconUsers,
  IconTrophy,
  IconSwords,
  IconCalendar,
  IconUser,
  IconUsersGroup,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconFlame,
} from '@tabler/icons-react'
import { useAuthStore, type User } from '../../store/authStore'

function useChallengeNewDot() {
  const STORAGE_KEY = 'preparena_last_seen_challenge'
  const today = new Date()
  // Show dot on Mondays (day 1) — new challenge just went live
  const isMonday = today.getDay() === 1
  const lastSeen = localStorage.getItem(STORAGE_KEY)
  const thisMonday = (() => {
    const d = new Date(today)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return d.toISOString().slice(0, 10)
  })()
  return isMonday && lastSeen !== thisMonday
}

const NAV_ITEMS = [
  { label: 'Dashboard',   to: '/dashboard',  icon: IconLayoutDashboard },
  { label: 'Problems',    to: '/problems',   icon: IconCode },
  { label: 'Challenges',  to: '/challenges', icon: IconFlame, newDot: true },
  { label: 'Friends',     to: '/friends',    icon: IconUsers },
  { label: 'Leaderboard', to: '/leaderboard',icon: IconTrophy },
  { label: 'Battles',     to: '/battles',    icon: IconSwords },
  { label: 'Revisions',   to: '/revisions',  icon: IconCalendar },
  { label: 'Groups',      to: '/groups',     icon: IconUsersGroup },
  { label: 'Profile',     to: '/profile',    icon: IconUser },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

function Avatar({ user, size }: { user: User | null; size: number }) {
  const initials = user?.name?.[0]?.toUpperCase() ?? '?'
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full bg-(--color-accent)/20 flex items-center justify-center text-(--color-accent) font-bold shrink-0"
    >
      {initials}
    </div>
  )
}

function NavContent({
  collapsed,
  onToggleCollapse,
  onLinkClick,
}: {
  collapsed: boolean
  onToggleCollapse?: () => void
  onLinkClick: () => void
}) {
  const { user, logout } = useAuthStore()
  const showChallengeDot = useChallengeNewDot()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo + collapse toggle (desktop only) */}
      <div className="flex items-center h-14 px-3 border-b border-(--color-border) shrink-0 gap-2">
        <img src="/assets/PrepArena_favicon.png" alt="PrepArena" className="w-7 h-7 object-contain shrink-0" />
        {!collapsed && (
          <span className="flex-1 text-sm font-bold tracking-tight text-(--color-text-primary) truncate">
            Prep<span className="text-(--color-accent)">Arena</span>
          </span>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`shrink-0 p-1 rounded-md text-(--color-text-secondary) hover:bg-(--color-bg) hover:text-(--color-text-primary) transition-colors ${collapsed ? 'mx-auto' : ''}`}
          >
            {collapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, to, icon: Icon, newDot }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onLinkClick}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              [
                'relative flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                collapsed ? 'justify-center' : 'gap-3',
                isActive
                  ? 'bg-(--color-accent)/10 text-(--color-accent)'
                  : 'text-(--color-text-secondary) hover:bg-(--color-bg) hover:text-(--color-text-primary)',
              ].join(' ')
            }
          >
            <span className="relative shrink-0">
              <Icon size={20} strokeWidth={1.75} />
              {newDot && showChallengeDot && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              )}
            </span>
            {!collapsed && <span className="flex-1">{label}</span>}
            {!collapsed && newDot && showChallengeDot && (
              <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                NEW
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-(--color-border) p-2 shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <Avatar user={user} size={32} />
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-(--color-text-secondary) hover:text-red-500 transition-colors rounded-lg hover:bg-(--color-bg)"
            >
              <IconLogout size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-1 py-1">
            <Avatar user={user} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-(--color-text-primary) truncate leading-tight">
                {user?.name ?? '—'}
              </p>
              <p className="text-xs text-(--color-text-secondary) truncate">
                @{user?.username ?? '—'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-(--color-text-secondary) hover:text-red-500 transition-colors rounded-lg hover:bg-(--color-bg) shrink-0"
            >
              <IconLogout size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={[
          'hidden lg:flex flex-col shrink-0',
          'bg-(--color-surface) border-r border-(--color-border)',
          'transition-all duration-300 overflow-hidden',
          collapsed ? 'w-16' : 'w-56',
        ].join(' ')}
      >
        <NavContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} onLinkClick={() => {}} />
      </aside>

      {/* ── Mobile backdrop ──────────────────────────────────────────────────── */}
      <div
        aria-hidden
        onClick={onMobileClose}
        className={[
          'fixed inset-0 z-30 bg-black/50 lg:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* ── Mobile panel ─────────────────────────────────────────────────────── */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-64 flex flex-col lg:hidden',
          'bg-(--color-surface) border-r border-(--color-border) shadow-2xl',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <button
          onClick={onMobileClose}
          aria-label="Close menu"
          className="absolute top-3 right-3 p-1.5 text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors z-10"
        >
          <IconX size={18} />
        </button>
        <NavContent collapsed={false} onLinkClick={onMobileClose} />
      </aside>
    </>
  )
}
