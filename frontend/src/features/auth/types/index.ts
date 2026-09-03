export type LoginCredentials = {
  email: string
  senha: string
}

export type RegisterAccountData = {
  nome: string
  sobrenome: string
  telefone: string
  cidade: string
  estado: string
  email: string
  senha: string
  nomePropriedadeRural: string
}

export type RegisterAccountResponse = {
  id: number
  nome: string
  sobrenome: string
  telefone: string
  cidade: string
  estado: string
  email: string
  nomePropriedadeRural: string
  role: 'USER' | 'ADMIN'
  criadoEm: string
}

export type LoginResponse = {
  token: string
  tipo: string
  usuarioId: number
  nome: string
  email: string
  nomeFazenda?: string
  role: 'USER' | 'ADMIN'
}

export type User = {
  id: number
  nome: string
  email: string
  nomeFazenda?: string
  role: 'USER' | 'ADMIN'
}

export type AuthContextData = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}
