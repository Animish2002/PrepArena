import { NavLink } from 'react-router-dom'
import {
  IconLayoutDashboard,
  IconCode,
  IconUsers,
  IconTrophy,
  IconSwords,
  IconCalendar,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from '@tabler/icons-react'
import { useAuthStore, type User } from '../../store/authStore'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: IconLayoutDashboard },
  { label: 'Problems', to: '/problems', icon: IconCode },
  { label: 'Friends', to: '/friends', icon: IconUsers },
  { label: 'Leaderboard', to: '/leaderboard', icon: IconTrophy },
  { label: 'Battles', to: '/battles', icon: IconSwords },
  { label: 'Revisions', to: '/revisions', icon: IconCalendar },
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

function NavContent({ collapsed, onLinkClick }: { collapsed: boolean; onLinkClick: () => void }) {
  const { user, logout } = useAuthStore()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div
        className={`flex items-center h-14 px-3 border-b border-(--color-border) shrink-0 ${
          collapsed ? 'justify-center' : 'gap-2'
        }`}
      >
        <div className="w-7 h-7 rounded-lg bg-(--color-accent) flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <polygon points="7,1 13,4.5 13,10.5 7,14 1,10.5 1,4.5" stroke="white" strokeWidth="1.5" fill="none" />
            <polygon points="7,5 9.5,7 7,9 4.5,7" fill="white" />
          </svg>
        </div>
        {!collapsed && (
          <span className="font-bold text-base text-(--color-accent) tracking-tight">PrepArena</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onLinkClick}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              [
                'flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                collapsed ? 'justify-center' : 'gap-3',
                isActive
                  ? 'bg-(--color-accent)/10 text-(--color-accent)'
                  : 'text-(--color-text-secondary) hover:bg-(--color-bg) hover:text-(--color-text-primary)',
              ].join(' ')
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            {!collapsed && <span>{label}</span>}
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
          'hidden lg:flex flex-col flex-shrink-0 relative',
          'bg-(--color-surface) border-r border-(--color-border)',
          'transition-all duration-300 overflow-hidden',
          collapsed ? 'w-16' : 'w-60',
        ].join(' ')}
      >
        <NavContent collapsed={collapsed} onLinkClick={() => {}} />

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-4 -right-3 z-10 w-6 h-6 rounded-full bg-(--color-surface) border border-(--color-border) flex items-center justify-center text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors shadow-sm"
        >
          {collapsed ? <IconChevronRight size={12} /> : <IconChevronLeft size={12} />}
        </button>
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
