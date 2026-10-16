import { isAxiosError } from 'axios'

export function getFriendlyRequestError(error: unknown, fallback: string) {
  if (!isAxiosError(error) || !error.response) return 'Não foi possível conectar ao servidor. Tente novamente.'
  const data = error.response.data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') return data.message
  return fallback
}
