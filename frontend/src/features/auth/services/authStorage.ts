import { type LoginResponse, type User } from '../types'

export const AUTH_TOKEN_STORAGE_KEY = '@GestaoPecuaria:token'
export const AUTH_USER_STORAGE_KEY = '@GestaoPecuaria:user'

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export function getStoredUser() {
  const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as User
  } catch {
    clearAuthStorage()
    return null
  }
}

export function saveAuthStorage(loginResponse: LoginResponse) {
  const user: User = {
    id: loginResponse.usuarioId,
    nome: loginResponse.nome,
    email: loginResponse.email,
  }

  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, loginResponse.token)
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))

  return user
}

export function clearAuthStorage() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}
