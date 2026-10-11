import { type SexoAnimal } from '../../animais/types/animal.types'
import { type FormaPagamento, type TipoPagamentoContaPagar } from '../../a-pagar/types/contaPagar.types'

export type TipoRateioCompra = 'PROPORCIONAL_PESO' | 'IGUAL' | 'MANUAL'

export interface CompraAnimalRequest {
  codigoAnimal: number
  raca: string
  sexo: SexoAnimal
  pesoKg: number
  imagemUrl?: string
  pastoId?: number
  valorPago?: number
}

export interface CompraRequest {
  fornecedor: string
  dataCompra: string
  valorTotal: number
  observacao?: string
  tipoRateio: TipoRateioCompra
  tipoPagamento: TipoPagamentoContaPagar
  pagamentoRealizadoNoAto?: boolean
  dataPagamento?: string
  formaPagamento?: FormaPagamento
  dataVencimento?: string
  quantidadeParcelas?: number
  primeiroVencimento?: string
  intervaloDias?: number
  animais: CompraAnimalRequest[]
}

export interface CompraAnimalResumo {
  id: number
  codigoAnimal: number
  raca: string
  pesoKg: number
  valorPago: number
  status: string
}

export interface CompraResponse {
  id: number
  fornecedor: string
  dataCompra: string
  valorTotal: number
  observacao?: string | null
  quantidadeAnimais: number
  pesoTotalKg: number
  valorMedioAnimal: number
  animais: CompraAnimalResumo[]
  criadoEm: string
}
