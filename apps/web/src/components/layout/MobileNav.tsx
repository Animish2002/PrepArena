import { NavLink } from 'react-router-dom'
import {
  IconLayoutDashboard,
  IconCode,
  IconUsers,
  IconSwords,
  IconUser,
} from '@tabler/icons-react'

const TABS = [
  { label: 'Home', to: '/dashboard', icon: IconLayoutDashboard },
  { label: 'Problems', to: '/problems', icon: IconCode },
  { label: 'Friends', to: '/friends', icon: IconUsers },
  { label: 'Battles', to: '/battles', icon: IconSwords },
  { label: 'Profile', to: '/profile', icon: IconUser },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-(--color-surface) border-t border-(--color-border) flex safe-bottom">
      {TABS.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/battles'}
          className={({ isActive }) =>
            [
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 pb-3 text-[10px] font-medium transition-colors',
              isActive ? 'text-(--color-accent)' : 'text-(--color-text-secondary)',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
