import { api } from '../../../services/api'
import {
  type ContaPagar,
  type ContaPagarFilters,
  type ContaPagarResumo,
  type CriarContaPagarRequest,
  type ParcelaContaPagar,
  type RegistrarPagamentoParcelaRequest,
} from '../types/contaPagar.types'

type NumericApiValue = number | string | null | undefined

type ContaPagarApiResponse = Omit<ContaPagar, 'id' | 'valorTotal' | 'valorPago' | 'valorRestante' | 'parcelas'> & {
  id: number | string
  valorTotal: NumericApiValue
  valorPago: NumericApiValue
  valorRestante: NumericApiValue
  quantidadeParcelas?: number | string | null
  parcelas?: ParcelaContaPagarApiResponse[] | null
}

type ParcelaContaPagarApiResponse = Omit<ParcelaContaPagar, 'id' | 'valor'> & {
  id: number | string
  valor: NumericApiValue
}

type ContaPagarResumoApiResponse = {
  totalAPagar: NumericApiValue
  totalVencido: NumericApiValue
  totalProximos7Dias: NumericApiValue
  totalPagoMesAtual: NumericApiValue
  quantidadeVencidas: NumericApiValue
}

function toNumber(value: NumericApiValue) {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  return Number(value)
}

function normalizeParcela(data: ParcelaContaPagarApiResponse): ParcelaContaPagar {
  return {
    ...data,
    id: Number(data.id),
    valor: toNumber(data.valor),
    diasParaVencimento:
      data.diasParaVencimento === null || data.diasParaVencimento === undefined
        ? null
        : Number(data.diasParaVencimento),
  }
}

function normalizeConta(data: ContaPagarApiResponse): ContaPagar {
  const parcelas = (data.parcelas ?? []).map(normalizeParcela)

  return {
    ...data,
    id: Number(data.id),
    valorTotal: toNumber(data.valorTotal),
    valorPago: toNumber(data.valorPago),
    valorRestante: toNumber(data.valorRestante),
    quantidadeParcelas: Number(data.quantidadeParcelas ?? parcelas.length),
    parcelas,
  }
}

function normalizeResumo(data: ContaPagarResumoApiResponse): ContaPagarResumo {
  return {
    totalAPagar: toNumber(data.totalAPagar),
    totalVencido: toNumber(data.totalVencido),
    totalProximos7Dias: toNumber(data.totalProximos7Dias),
    totalPagoMesAtual: toNumber(data.totalPagoMesAtual),
    quantidadeVencidas: toNumber(data.quantidadeVencidas),
  }
}

export const contaPagarService = {
  async listar(filters: ContaPagarFilters = {}): Promise<ContaPagar[]> {
    const response = await api.get<ContaPagarApiResponse[]>('/contas-pagar', {
      params: {
        status: filters.status,
        categoria: filters.categoria,
        fornecedor: filters.fornecedor || undefined,
        inicio: filters.inicio,
        fim: filters.fim,
      },
    })

    return response.data.map(normalizeConta)
  },

  async buscarResumo(): Promise<ContaPagarResumo> {
    const response = await api.get<ContaPagarResumoApiResponse>('/contas-pagar/resumo')
    return normalizeResumo(response.data)
  },

  async buscarPorId(id: number): Promise<ContaPagar> {
    const response = await api.get<ContaPagarApiResponse>(`/contas-pagar/${id}`)
    return normalizeConta(response.data)
  },

  async criar(data: CriarContaPagarRequest): Promise<ContaPagar> {
    const response = await api.post<ContaPagarApiResponse>('/contas-pagar', data)
    return normalizeConta(response.data)
  },

  async registrarPagamento(parcelaId: number, data: RegistrarPagamentoParcelaRequest): Promise<ContaPagar> {
    const response = await api.patch<ContaPagarApiResponse>(`/contas-pagar/parcelas/${parcelaId}/pagar`, data)
    return normalizeConta(response.data)
  },

  async cancelar(id: number): Promise<ContaPagar> {
    const response = await api.patch<ContaPagarApiResponse>(`/contas-pagar/${id}/cancelar`)
    return normalizeConta(response.data)
  },
}
