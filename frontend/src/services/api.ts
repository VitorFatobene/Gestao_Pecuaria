import axios from 'axios'
import { AUTH_TOKEN_STORAGE_KEY, clearAuthStorage } from '../features/auth/services/authStorage'

export const api = axios.create({
  baseURL: 'http://localhost:8080',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthStorage()
      window.dispatchEvent(new Event('auth:logout'))

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)
