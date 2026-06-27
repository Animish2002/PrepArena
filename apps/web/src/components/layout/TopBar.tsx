import { useLocation } from 'react-router-dom'
import { IconBolt, IconFlame, IconSun, IconMoon, IconBell, IconMenu2 } from '@tabler/icons-react'
import { useTheme } from '../../context/ThemeContext'
import { useProgressStore } from '../../store/progressStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/problems': 'Problems',
  '/friends': 'Friends',
  '/leaderboard': 'Leaderboard',
  '/battles': 'Battles',
  '/revisions': 'Revisions',
}

interface TopBarProps {
  onMenuToggle: () => void
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const stats = useProgressStore((s) => s.stats)

  const title = PAGE_TITLES[pathname] ?? 'PrepArena'
  const weeklyXp = stats?.xp.weekly ?? 0
  const totalXp = stats?.xp.total ?? 0

  return (
    <header className="h-14 flex items-center gap-2 px-4 border-b border-(--color-border) bg-(--color-surface) shrink-0">
      {/* Mobile menu button */}
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
        {theme === 'dark'
          ? <IconSun size={18} strokeWidth={1.75} />
          : <IconMoon size={18} strokeWidth={1.75} />}
      </button>

      {/* Notifications */}
      <button
        aria-label="Notifications"
        className="p-1.5 rounded-lg text-(--color-text-secondary) hover:bg-(--color-bg) hover:text-(--color-text-primary) transition-colors"
      >
        <IconBell size={18} strokeWidth={1.75} />
      </button>
    </header>
  )
}
