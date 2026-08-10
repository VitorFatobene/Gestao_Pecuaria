export type SaleStatus = 'CONCLUIDA' | 'PENDENTE' | 'CANCELADA'

export interface Venda {
  id: number
  animalId: number
  codigoAnimal: number | string
  nomeComprador: string
  valorVenda: number
  dataVenda: string
  pesoKgVenda: number
  pesoArrobaVenda: number
  racaAnimal?: string | null
  sexoAnimal?: 'MACHO' | 'FEMEA' | null
  pesoKgAnimal?: number | null
  valorCompraAnimal?: number | null
  valorFreteAnimal?: number | null
  pastoIdAnimal?: number | null
  nomePastoAnimal?: string | null
  status?: SaleStatus | null
  criadoEm?: string
}

export interface VendaRequest {
  animalId: number
  nomeComprador: string
  valorVenda: number
  dataVenda: string
  pesoKgVenda: number
}

export interface AnimalParaVenda {
  id: number
  codigoAnimal: string | number
  raca: string
  pesoKg: number
  status: string
  pasto?: {
    id: number
    nome: string
  }
}

export interface SalesFilterParams {
  inicio?: string
  fim?: string
  animalId?: number
  status?: SaleStatus
  busca?: string
}

export type FiltroVenda = Pick<SalesFilterParams, 'inicio' | 'fim'>

export interface SalesSummary {
  vendasMes: number
  faturamento: number
  ticketMedio: number
  animaisVendidos: number
}

export interface PeriodSummaryData {
  totalVendas: number
  faturamentoTotal: number
  animaisVendidos: number
  pesoTotalVendido: number
  conversao: number
}

export interface SalesChartPoint {
  mes: string
  faturamento: number
}
