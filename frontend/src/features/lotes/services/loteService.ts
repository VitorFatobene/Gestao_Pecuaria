import { api } from '../../../services/api'
import {
  type AddAnimalsToLoteRequest,
  type CreateLoteRequest,
  type Lote,
} from '../types/lote.types'

export const criarLote = async (data: CreateLoteRequest): Promise<Lote> => {
  const response = await api.post<Lote>('/lotes', {
    nome: data.nome.trim(),
    descricao: data.descricao?.trim() || undefined,
  })

  return response.data
}

export const adicionarAnimaisAoLote = async (
  loteId: number,
  data: AddAnimalsToLoteRequest,
): Promise<Lote> => {
  const response = await api.patch<Lote>(`/lotes/${loteId}/adicionar-animais`, data)
  return response.data
}
