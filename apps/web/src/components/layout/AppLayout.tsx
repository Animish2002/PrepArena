import { useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useAuthStore } from '../../store/authStore'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileNav from './MobileNav'
import ToastStack from '../ui/Toast'
import { useFeedWebSocket } from '../../hooks/useFeedWebSocket'

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useFeedWebSocket()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-(--color-bg)">
        <div className="w-8 h-8 border-2 border-(--color-accent) border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-(--color-bg)">
      <ToastStack />
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <MobileNav />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar onMenuToggle={() => setMobileOpen((o) => !o)} />

        <main
          className={`flex-1 ${
            location.pathname.startsWith('/problems') || location.pathname.startsWith('/battles/')
              ? 'overflow-hidden'
              : 'overflow-y-auto p-4 md:p-6'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={
                location.pathname.startsWith('/problems') || location.pathname.startsWith('/battles/')
                  ? 'h-full'
                  : undefined
              }
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
