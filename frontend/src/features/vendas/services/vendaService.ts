import { api } from '../../../services/api'
import {
  type AnimalParaVenda,
  type Venda,
  type VendaRequest,
} from '../types/venda.types'

type AnimalParaVendaApiResponse = AnimalParaVenda & {
  pastoId?: number | null
  nomePasto?: string | null
  pasto?: {
    id: number
    nome: string
  } | null
}

function normalizeAnimalParaVenda(data: AnimalParaVendaApiResponse): AnimalParaVenda {
  const pasto =
    data.pasto ??
    (data.pastoId && data.nomePasto
      ? {
          id: data.pastoId,
          nome: data.nomePasto,
        }
      : undefined)

  return {
    id: data.id,
    codigoAnimal: data.codigoAnimal,
    raca: data.raca,
    pesoKg: data.pesoKg,
    status: data.status,
    pasto,
  }
}

export const listarVendas = async (): Promise<Venda[]> => {
  const response = await api.get<Venda[]>('/vendas')
  return response.data
}

export const buscarVendaPorId = async (id: number): Promise<Venda> => {
  const response = await api.get<Venda>(`/vendas/${id}`)
  return response.data
}

export const criarVenda = async (data: VendaRequest): Promise<Venda> => {
  const response = await api.post<Venda>('/vendas', data)
  return response.data
}

export const buscarVendaPorAnimal = async (animalId: number): Promise<Venda> => {
  const response = await api.get<Venda>(`/vendas/animal/${animalId}`)
  return response.data
}

export const buscarVendasPorData = async (inicio: string, fim: string): Promise<Venda[]> => {
  const response = await api.get<Venda[]>('/vendas/data-venda', {
    params: { inicio, fim },
  })

  return response.data
}

export const buscarAnimaisAtivos = async (): Promise<AnimalParaVenda[]> => {
  const response = await api.get<AnimalParaVendaApiResponse[]>('/animais')
  return response.data.map(normalizeAnimalParaVenda).filter((animal) => animal.status === 'ATIVO')
}
