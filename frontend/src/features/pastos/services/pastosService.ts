import { api } from '../../../services/api'
import { type AnimalPasto, type Pasto, type PastoRequestDTO } from '../types/pastos.types'

export const getPastos = async (): Promise<Pasto[]> => {
  const response = await api.get<Pasto[]>('/pastos')
  return response.data
}

export const getPastoById = async (id: number): Promise<Pasto> => {
  const response = await api.get<Pasto>(`/pastos/${id}`)
  return response.data
}

export const getAnimaisAtivosByPasto = async (pastoId: number): Promise<AnimalPasto[]> => {
  const response = await api.get<AnimalPasto[]>(`/animais/pasto/${pastoId}`)
  return response.data
}

export const getAnimaisAtivosCountByPasto = async (pastoId: number): Promise<number> => {
  const animais = await getAnimaisAtivosByPasto(pastoId)
  return animais.length
}

export const removerAnimalDoPasto = async (animalId: number): Promise<AnimalPasto> => {
  const response = await api.patch<AnimalPasto>(`/animais/${animalId}/remover-pasto`)
  return response.data
}

export const createPasto = async (data: PastoRequestDTO): Promise<Pasto> => {
  const response = await api.post<Pasto>('/pastos', data)
  return response.data
}

export const updatePasto = async (id: number, data: PastoRequestDTO): Promise<Pasto> => {
  const response = await api.put<Pasto>(`/pastos/${id}`, data)
  return response.data
}

export const ativarPasto = async (id: number): Promise<Pasto> => {
  const response = await api.patch<Pasto>(`/pastos/${id}/ativar`)
  return response.data
}

export const desativarPasto = async (id: number): Promise<Pasto> => {
  const response = await api.patch<Pasto>(`/pastos/${id}/desativar`)
  return response.data
}
