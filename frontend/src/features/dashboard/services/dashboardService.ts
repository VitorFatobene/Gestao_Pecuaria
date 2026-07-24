import { api } from '../../../services/api'
import { type DashboardResponse } from '../types/dashboard.types'

export const getDashboardData = async (): Promise<DashboardResponse> => {
  const response = await api.get<DashboardResponse>('/dashboard')
  return response.data
}
