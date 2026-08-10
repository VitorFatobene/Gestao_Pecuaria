import { api } from '../../../services/api'
import {
  type AnimalParaVenda,
  type Venda,
  type VendaRequest,
} from '../types/vendas.types'

type AnimalParaVendaApiResponse = AnimalParaVenda & {
  pastoId?: number | null
  nomePasto?: string | null
  pasto?: {
    id: number
    nome: string
  } | null
}

type VendaApiResponse = Venda & {
  valorVenda: number | string
  pesoKgVenda: number | string
  pesoArrobaVenda: number | string
  pesoKgAnimal?: number | string | null
  valorCompraAnimal?: number | string | null
  valorFreteAnimal?: number | string | null
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  return Number(value)
}

function normalizeVenda(data: VendaApiResponse): Venda {
  return {
    ...data,
    valorVenda: toNumber(data.valorVenda),
    pesoKgVenda: toNumber(data.pesoKgVenda),
    pesoArrobaVenda: toNumber(data.pesoArrobaVenda),
    pesoKgAnimal: data.pesoKgAnimal === null || data.pesoKgAnimal === undefined ? null : toNumber(data.pesoKgAnimal),
    valorCompraAnimal:
      data.valorCompraAnimal === null || data.valorCompraAnimal === undefined ? null : toNumber(data.valorCompraAnimal),
    valorFreteAnimal:
      data.valorFreteAnimal === null || data.valorFreteAnimal === undefined ? null : toNumber(data.valorFreteAnimal),
  }
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
    pesoKg: toNumber(data.pesoKg),
    status: data.status,
    pasto,
  }
}

export const listarVendas = async (): Promise<Venda[]> => {
  const response = await api.get<VendaApiResponse[]>('/vendas')
  return response.data.map(normalizeVenda)
}

export const buscarVendaPorId = async (id: number): Promise<Venda> => {
  const response = await api.get<VendaApiResponse>(`/vendas/${id}`)
  return normalizeVenda(response.data)
}

export const criarVenda = async (data: VendaRequest): Promise<Venda> => {
  const response = await api.post<VendaApiResponse>('/vendas', data)
  return normalizeVenda(response.data)
}

export const buscarVendaPorAnimal = async (animalId: number): Promise<Venda> => {
  const response = await api.get<VendaApiResponse>(`/vendas/animal/${animalId}`)
  return normalizeVenda(response.data)
}

export const buscarVendasPorData = async (inicio: string, fim: string): Promise<Venda[]> => {
  const response = await api.get<VendaApiResponse[]>('/vendas/data-venda', {
    params: { inicio, fim },
  })

  return response.data.map(normalizeVenda)
}

export const buscarAnimaisAtivos = async (): Promise<AnimalParaVenda[]> => {
  const response = await api.get<AnimalParaVendaApiResponse[]>('/animais')
  return response.data.map(normalizeAnimalParaVenda).filter((animal) => animal.status === 'ATIVO')
}
