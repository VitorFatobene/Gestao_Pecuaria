export type CategoriaContaPagar = 'ANIMAL' | 'RACAO' | 'SUPLEMENTOS_PASTO'
export type TipoPagamentoContaPagar = 'A_VISTA' | 'PRAZO' | 'PARCELADO'
export type StatusContaPagar = 'PENDENTE' | 'PARCIALMENTE_PAGA' | 'PAGA' | 'CANCELADA'
export type StatusParcelaContaPagar = 'PENDENTE' | 'PAGA' | 'ATRASADA' | 'CANCELADA'
export type FormaPagamento = 'PIX' | 'DINHEIRO' | 'TRANSFERENCIA' | 'BOLETO' | 'OUTROS'

export interface ContaPagarResumo {
  totalAPagar: number
  totalVencido: number
  totalProximos7Dias: number
  totalPagoMesAtual: number
  quantidadeVencidas: number
}

export interface ParcelaContaPagar {
  id: number
  numeroParcela: number
  valor: number
  dataVencimento: string
  dataPagamento?: string | null
  status: StatusParcelaContaPagar
  formaPagamento?: FormaPagamento | null
  diasParaVencimento?: number | null
  atrasada: boolean
}

export interface ContaPagar {
  id: number
  descricao: string
  categoria: CategoriaContaPagar
  fornecedor: string
  valorTotal: number
  valorPago: number
  valorRestante: number
  dataCompra: string
  tipoPagamento: TipoPagamentoContaPagar
  status: StatusContaPagar
  observacao?: string | null
  quantidadeParcelas: number
  parcelas: ParcelaContaPagar[]
  criadoEm?: string
}

export interface ContaPagarFilters {
  status?: StatusContaPagar
  categoria?: CategoriaContaPagar
  fornecedor?: string
  inicio?: string
  fim?: string
}

export interface CriarContaPagarRequest {
  descricao: string
  categoria: CategoriaContaPagar
  fornecedor: string
  valorTotal: number
  dataCompra: string
  tipoPagamento: TipoPagamentoContaPagar
  dataVencimento?: string
  quantidadeParcelas?: number
  primeiroVencimento?: string
  intervaloDias?: number
  observacao?: string
}

export interface RegistrarPagamentoParcelaRequest {
  dataPagamento: string
  formaPagamento: FormaPagamento
}
