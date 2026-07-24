import { api } from '../../../services/api'
import { type LoginCredentials, type LoginResponse } from '../types'

export async function loginService(credentials: LoginCredentials) {
  const response = await api.post<LoginResponse>('/auth/login', credentials)

  return response.data
}
