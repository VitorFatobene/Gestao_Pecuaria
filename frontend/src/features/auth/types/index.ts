export type LoginCredentials = {
  email: string
  senha: string
}

export type LoginResponse = {
  token: string
  tipo: string
  usuarioId: number
  nome: string
  email: string
}

export type User = {
  id: number
  nome: string
  email: string
}

export type AuthContextData = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}
