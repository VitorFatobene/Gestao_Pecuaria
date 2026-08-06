import { api } from '../../../services/api'
import {
  type Animal,
  type AnimalRequest,
  type AnimalStatus,
  type PastoDropdown,
  type SexoAnimal,
} from '../types/animal.types'

type AnimalApiResponse = Omit<Animal, 'codigoAnimal' | 'pasto'> & {
  codigoAnimal: string | number
  status?: AnimalStatus | null
  sexo?: SexoAnimal | null
  pastoId?: number | null
  nomePasto?: string | null
  pasto?: {
    id: number
    nome: string
  } | null
}

type AnimalApiRequest = Omit<AnimalRequest, 'codigoAnimal'> & {
  codigoAnimal: number
  valorFrete: number
}

function normalizeAnimal(data: AnimalApiResponse): Animal {
  const pasto =
    data.pasto ??
    (data.pastoId && data.nomePasto
      ? {
          id: data.pastoId,
          nome: data.nomePasto,
        }
      : undefined)

  return {
    ...data,
    codigoAnimal: String(data.codigoAnimal),
    sexo: data.sexo ?? undefined,
    valorFrete: data.valorFrete ?? undefined,
    nomeVendedor: data.nomeVendedor ?? undefined,
    imagemUrl: data.imagemUrl ?? undefined,
    status: data.status ?? 'ATIVO',
    pasto,
  }
}

function toApiRequest(data: AnimalRequest): AnimalApiRequest {
  return {
    ...data,
    codigoAnimal: Number(data.codigoAnimal),
    valorFrete: data.valorFrete ?? 0,
    nomeVendedor: data.nomeVendedor?.trim() || undefined,
    imagemUrl: data.imagemUrl?.trim() || undefined,
  }
}

export const listarAnimais = async (): Promise<Animal[]> => {
  const response = await api.get<AnimalApiResponse[]>('/animais')
  return response.data.map(normalizeAnimal)
}

export const buscarAnimalPorId = async (id: number): Promise<Animal> => {
  const response = await api.get<AnimalApiResponse>(`/animais/${id}`)
  return normalizeAnimal(response.data)
}

export const criarAnimal = async (data: AnimalRequest): Promise<Animal> => {
  const response = await api.post<AnimalApiResponse>('/animais', toApiRequest(data))
  return normalizeAnimal(response.data)
}

export const atualizarAnimal = async (id: number, data: AnimalRequest): Promise<Animal> => {
  const response = await api.put<AnimalApiResponse>(`/animais/${id}`, toApiRequest(data))
  return normalizeAnimal(response.data)
}

export const alterarPastoAnimal = async (animalId: number, pastoId: number): Promise<Animal> => {
  const response = await api.patch<AnimalApiResponse>(`/animais/${animalId}/alterar-pasto/${pastoId}`)
  return normalizeAnimal(response.data)
}

export const deletarAnimal = async (id: number): Promise<void> => {
  await api.delete(`/animais/${id}`)
}

export const listarAnimaisPorPasto = async (pastoId: number): Promise<Animal[]> => {
  const response = await api.get<AnimalApiResponse[]>(`/animais/pasto/${pastoId}`)
  return response.data.map(normalizeAnimal)
}

export const buscarPorDataCompra = async (inicio: string, fim: string): Promise<Animal[]> => {
  const response = await api.get<AnimalApiResponse[]>('/animais/data-compra', {
    params: { inicio, fim },
  })
  return response.data.map(normalizeAnimal)
}

export const buscarPastosDropdown = async (): Promise<PastoDropdown[]> => {
  const response = await api.get<PastoDropdown[]>('/pastos')
  return response.data
}
