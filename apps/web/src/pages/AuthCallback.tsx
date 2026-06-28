import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const fullUrl = window.location.href
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    console.log('[AuthCallback] full URL:', fullUrl)
    console.log('[AuthCallback] token present:', !!token)
    console.log('[AuthCallback] token length:', token?.length ?? 0)

    if (token) {
      localStorage.setItem('preParena_token', token)
      console.log('[AuthCallback] token saved to localStorage')
    } else {
      console.warn('[AuthCallback] NO token in URL — check API redirect')
    }

    navigate('/dashboard', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg)">
      <div className="w-5 h-5 rounded-full border-2 border-(--color-accent) border-t-transparent animate-spin" />
    </div>
  )
}
