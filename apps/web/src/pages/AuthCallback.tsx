import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { fetchMe } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('preParena_token', token)
      // fetchMe now runs with the token already in localStorage
      fetchMe().finally(() => navigate('/dashboard', { replace: true }))
    } else {
      console.warn('[AuthCallback] no token in URL')
      navigate('/login', { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg)">
      <div className="w-5 h-5 rounded-full border-2 border-(--color-accent) border-t-transparent animate-spin" />
    </div>
  )
}
