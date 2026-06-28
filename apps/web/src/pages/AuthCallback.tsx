import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('preParena_token', token)
    }
    navigate('/dashboard', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg)">
      <div className="w-5 h-5 rounded-full border-2 border-(--color-accent) border-t-transparent animate-spin" />
    </div>
  )
}
