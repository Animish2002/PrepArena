import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './store/authStore.ts'

// Bootstrap: check current session before first render.
// Skip on /auth/callback — the component saves the token and calls fetchMe itself.
if (!window.location.pathname.startsWith('/auth/callback')) {
  useAuthStore.getState().fetchMe()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
