import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { AuthContext } from './AuthContextValue'
import { loginService } from '../services/authService'
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  saveAuthStorage,
  saveStoredUser,
} from '../services/authStorage'
import {
  type AuthContextData,
  type LoginCredentials,
  type User,
} from '../types'

function getInitialAuthState() {
  const storedToken = getStoredToken()
  const storedUser = getStoredUser()

  if (storedToken && storedUser) {
    return {
      token: storedToken,
      user: storedUser,
    }
  }

  clearAuthStorage()

  return {
    token: null,
    user: null,
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [authState, setAuthState] = useState<{
    user: User | null
    token: string | null
  }>({
    user: null,
    token: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    clearAuthStorage()
    setAuthState({
      user: null,
      token: null,
    })
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const loginResponse = await loginService(credentials)
    const authenticatedUser = saveAuthStorage(loginResponse)

    setAuthState({
      user: authenticatedUser,
      token: loginResponse.token,
    })
  }, [])

  const updateUser = useCallback((user: User) => {
    saveStoredUser(user)
    setAuthState((currentAuthState) => ({
      ...currentAuthState,
      user,
    }))
  }, [])

  useEffect(() => {
    const initialAuthState = getInitialAuthState()
    const timeoutId = window.setTimeout(() => {
      setAuthState(initialAuthState)
      setIsLoading(false)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('auth:logout', logout)

    return () => {
      window.removeEventListener('auth:logout', logout)
    }
  }, [logout])

  const value = useMemo<AuthContextData>(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: Boolean(authState.token && authState.user),
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [authState.token, authState.user, isLoading, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
