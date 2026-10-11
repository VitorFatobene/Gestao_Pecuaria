import { api } from '../../../services/api'
import { type CompraRequest, type CompraResponse } from '../types/compra.types'

export const criarCompra = async (data: CompraRequest): Promise<CompraResponse> => {
  const response = await api.post<CompraResponse>('/compras', data)
  return response.data
}
