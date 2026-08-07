import { api } from '../../../services/api'
import {
  type LoginCredentials,
  type LoginResponse,
  type RegisterAccountData,
  type RegisterAccountResponse,
} from '../types'

export async function loginService(credentials: LoginCredentials) {
  const response = await api.post<LoginResponse>('/auth/login', credentials)

  return response.data
}

export async function registerAccountService(data: RegisterAccountData) {
  const response = await api.post<RegisterAccountResponse>('/usuarios', data)

  return response.data
}
