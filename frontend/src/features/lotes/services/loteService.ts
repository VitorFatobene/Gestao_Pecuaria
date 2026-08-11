import { api } from '../../../services/api'
import {
  type AddAnimalsToLoteRequest,
  type CreateLoteRequest,
  type Lote,
} from '../types/lote.types'

type LoteApiResponse = Omit<Lote, 'animais'> & {
  animais?: Array<Omit<Lote['animais'][number], 'codigoAnimal'> & { codigoAnimal: string | number }> | null
}

function normalizeLote(data: LoteApiResponse): Lote {
  return {
    ...data,
    descricao: data.descricao ?? undefined,
    pesoTotalKg: Number(data.pesoTotalKg ?? 0),
    criadoEm: data.criadoEm ?? undefined,
    animais: (data.animais ?? []).map((animal) => ({
      ...animal,
      codigoAnimal: String(animal.codigoAnimal),
      sexo: animal.sexo ?? undefined,
      pesoKg: Number(animal.pesoKg ?? 0),
    })),
  }
}

export const buscarLotes = async (): Promise<Lote[]> => {
  const response = await api.get<LoteApiResponse[]>('/lotes')
  return response.data.map(normalizeLote)
}

export const buscarLotePorId = async (id: number): Promise<Lote> => {
  const response = await api.get<LoteApiResponse>(`/lotes/${id}`)
  return normalizeLote(response.data)
}

export const criarLote = async (data: CreateLoteRequest): Promise<Lote> => {
  const response = await api.post<LoteApiResponse>('/lotes', {
    nome: data.nome.trim(),
    descricao: data.descricao?.trim() || undefined,
  })

  return normalizeLote(response.data)
}

export const atualizarLote = async (id: number, data: CreateLoteRequest): Promise<Lote> => {
  const response = await api.put<LoteApiResponse>(`/lotes/${id}`, {
    nome: data.nome.trim(),
    descricao: data.descricao?.trim() || undefined,
  })

  return normalizeLote(response.data)
}

export const adicionarAnimaisAoLote = async (
  loteId: number,
  data: AddAnimalsToLoteRequest,
): Promise<Lote> => {
  const response = await api.patch<LoteApiResponse>(`/lotes/${loteId}/adicionar-animais`, data)
  return normalizeLote(response.data)
}

export const removerAnimalDoLote = async (loteId: number, animalId: number): Promise<Lote> => {
  const response = await api.delete<LoteApiResponse>(`/lotes/${loteId}/animais/${animalId}`)
  return normalizeLote(response.data)
}

export const cancelarLote = async (id: number): Promise<Lote> => {
  const response = await api.patch<LoteApiResponse>(`/lotes/${id}/cancelar`)
  return normalizeLote(response.data)
}
