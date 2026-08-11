export type SaleStatus = 'CONCLUIDA' | 'PENDENTE' | 'CANCELADA' | 'AGUARDANDO_PAGAMENTO' | 'PAGA'
export type TipoPagamento = 'A_VISTA' | 'PRAZO' | 'PARCELADO'
export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO'
export type FormaPagamento = 'PIX' | 'DINHEIRO' | 'TRANSFERENCIA' | 'BOLETO' | 'OUTROS'

export interface Venda {
  id: number
  animalId?: number
  loteId?: number
  codigoAnimal?: number | string
  nomeLote?: string
  nomeComprador: string
  valorVenda: number
  valorTotal?: number
  dataVenda: string
  pesoKgVenda: number
  pesoArrobaVenda: number
  statusLote?: string
  quantidadeAnimaisLote?: number
  pesoTotalKgLote?: number
  pagamentos?: PagamentoVendaResponse[]
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

export interface CondicaoPagamento {
  tipoPagamento: TipoPagamento
  entrada?: number | null
  quantidadeParcelas?: number | null
  intervaloDias?: number | null
  diasCarencia?: number | null
}

export interface VendaLoteRequest {
  loteId: number
  comprador: string
  valorTotal: number
  dataVenda: string
  condicaoPagamento: CondicaoPagamento
}

export interface PagamentoVendaResponse {
  id: number
  numeroParcela: number
  valor: number
  dataVencimento: string
  dataPagamento?: string | null
  status: StatusPagamento
  formaPagamento?: FormaPagamento | null
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
