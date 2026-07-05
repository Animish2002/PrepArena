import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('preParena_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const publicPaths = ['/', '/login']
    const isPublic =
      publicPaths.includes(window.location.pathname) ||
      window.location.pathname.startsWith('/join/')
    if (error.response?.status === 401 && !isPublic) {
      localStorage.removeItem('preParena_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
