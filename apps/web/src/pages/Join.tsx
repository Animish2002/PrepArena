import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { IconBolt } from '@tabler/icons-react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'

interface Sender {
  id: string
  name: string
  username: string
  avatarUrl?: string | null
  solved: number
}

interface JoinData {
  success: boolean
  sender: Sender | null
  alreadyFriends: boolean
  friendshipId: string
}

type PageState = 'loading' | 'ready' | 'accepting' | 'done' | 'error'

const API_URL = import.meta.env.VITE_API_URL as string

export default function JoinPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()

  const [state, setState] = useState<PageState>('loading')
  const [joinData, setJoinData] = useState<JoinData | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      // Store token, redirect to login
      if (token) sessionStorage.setItem('pending_join_token', token)
      setState('ready') // show the "sign in" prompt
      return
    }

    // Authenticated — call the join endpoint
    if (!token) {
      setErrorMsg('Invalid invite link')
      setState('error')
      return
    }

    api
      .get<JoinData>(`/api/friends/join/${token}`)
      .then((r) => {
        setJoinData(r.data)
        setState('ready')
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.error ?? 'This invite link is invalid or has expired.'
        setErrorMsg(msg)
        setState('error')
      })
  }, [isAuthenticated, authLoading, token])

  async function handleAccept() {
    if (!joinData?.friendshipId) return
    setState('accepting')
    try {
      if (!joinData.alreadyFriends) {
        await api.post(`/api/friends/accept/${joinData.friendshipId}`)
      }
      setState('done')
      setTimeout(() => navigate('/dashboard', { replace: true }), 1200)
    } catch {
      setState('ready') // let user retry
    }
  }

  return (
    <div className="min-h-screen bg-(--color-bg) flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-(--color-accent) rounded-2xl flex items-center justify-center shadow-lg">
            <IconBolt size={24} stroke={2.5} className="text-white" />
          </div>
        </div>

        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 text-center shadow-lg">
          {/* Loading */}
          {state === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-7 h-7 border-2 border-(--color-accent) border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-(--color-text-secondary)">Loading invite…</p>
            </div>
          )}

          {/* Not logged in */}
          {state === 'ready' && !isAuthenticated && (
            <>
              <h1 className="text-xl font-bold text-(--color-text-primary) mb-2">
                You're invited to PrepArena!
              </h1>
              <p className="text-sm text-(--color-text-secondary) mb-6">
                Sign in with Google to accept the friend invite and start practicing DSA together.
              </p>
              <a
                href={`${API_URL}/auth/google`}
                className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-(--color-border) bg-(--color-bg) text-(--color-text-primary) text-sm font-semibold hover:bg-(--color-surface) transition-colors"
              >
                <GoogleIcon />
                Continue with Google
              </a>
            </>
          )}

          {/* Sender profile + accept */}
          {state === 'ready' && isAuthenticated && joinData?.sender && (
            <>
              <div className="flex flex-col items-center gap-3 mb-6">
                {joinData.sender.avatarUrl ? (
                  <img
                    src={joinData.sender.avatarUrl}
                    alt={joinData.sender.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-(--color-accent)/15 flex items-center justify-center text-(--color-accent) text-2xl font-bold">
                    {joinData.sender.name[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-(--color-text-primary) text-lg">{joinData.sender.name}</p>
                  <p className="text-sm text-(--color-text-secondary)">@{joinData.sender.username}</p>
                </div>
                <p className="text-sm text-(--color-text-secondary)">
                  <span className="font-semibold text-(--color-text-primary)">
                    {joinData.sender.solved}
                  </span>{' '}
                  problems solved
                </p>
              </div>

              <p className="text-base font-semibold text-(--color-text-primary) mb-1">
                {joinData.alreadyFriends
                  ? 'You\'re already friends!'
                  : `${joinData.sender.name.split(' ')[0]} wants to be your PrepArena friend`}
              </p>
              <p className="text-sm text-(--color-text-secondary) mb-6">
                {joinData.alreadyFriends
                  ? 'Head to your dashboard to see their progress.'
                  : 'Accept to see each other\'s progress and compete on the leaderboard.'}
              </p>

              <button
                onClick={handleAccept}
                disabled={false}
                className="w-full py-3 rounded-xl bg-(--color-accent) text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {joinData.alreadyFriends ? 'Go to Dashboard' : 'Accept & Join PrepArena'}
              </button>
            </>
          )}

          {/* Accepting */}
          {state === 'accepting' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-7 h-7 border-2 border-(--color-accent) border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-(--color-text-secondary)">Accepting invite…</p>
            </div>
          )}

          {/* Done */}
          {state === 'done' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="text-4xl">🎉</div>
              <p className="font-bold text-(--color-text-primary)">You're now friends!</p>
              <p className="text-sm text-(--color-text-secondary)">Redirecting to dashboard…</p>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <>
              <div className="text-4xl mb-3">😕</div>
              <p className="font-bold text-(--color-text-primary) mb-2">Invalid invite</p>
              <p className="text-sm text-(--color-text-secondary) mb-6">{errorMsg}</p>
              <button
                onClick={() => navigate('/dashboard', { replace: true })}
                className="w-full py-2.5 rounded-xl border border-(--color-border) text-(--color-text-secondary) text-sm hover:bg-(--color-bg) transition-colors"
              >
                Go to Dashboard
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-(--color-text-secondary) mt-4 opacity-60">
          PrepArena — Practice DSA with friends
        </p>
      </motion.div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
