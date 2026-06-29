import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import ProblemsPage from './pages/Problems'
import FriendsPage from './pages/Friends'
import LeaderboardPage from './pages/Leaderboard'
import BattlePage from './pages/Battle'
import BattleArena from './pages/BattleArena'
import RevisionsPage from './pages/Revisions'
import ProfilePage from './pages/Profile'
import GroupsPage from './pages/Groups'
import ChallengePage from './pages/ChallengePage'
import JoinPage from './pages/Join'
import AuthCallback from './pages/AuthCallback'
import { useAuthStore } from './store/authStore'

// After auth completes, check if the user was trying to accept a friend invite
function PendingJoinRedirect() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const token = sessionStorage.getItem('pending_join_token')
      if (token) {
        sessionStorage.removeItem('pending_join_token')
        navigate(`/join/${token}`, { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, navigate])

  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <PendingJoinRedirect />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/join/:token" element={<JoinPage />} />

          {/* All authenticated pages share the AppLayout shell */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/battles" element={<BattlePage />} />
            <Route path="/battles/:id" element={<BattleArena />} />
            <Route path="/revisions" element={<RevisionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/challenges" element={<ChallengePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
