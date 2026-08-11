export type AnimalStatus = 'ATIVO' | 'INATIVO' | 'VENDIDO'

export type SexoAnimal = 'MACHO' | 'FEMEA'

export type LoteStatus = 'ABERTO' | 'VENDIDO' | 'CANCELADO'

export interface Animal {
  id: number
  codigoAnimal: string
  raca: string
  sexo?: SexoAnimal
  pesoKg: number
  pesoArroba?: number
  valorPago: number
  valorFrete?: number
  nomeVendedor?: string
  dataCompra: string
  imagemUrl?: string
  status: AnimalStatus
  pasto?: {
    id: number
    nome: string
  }
  lote?: {
    id: number
    nome: string
    status: LoteStatus
  }
}

export interface AnimalRequest {
  codigoAnimal: string
  raca: string
  sexo: SexoAnimal
  pesoKg: number
  valorPago: number
  valorFrete?: number
  nomeVendedor?: string
  dataCompra: string
  imagemUrl?: string
  pastoId: number
}

export interface AnimalFilterParams {
  busca?: string
  pastoId?: number
  status?: string
  raca?: string
}

export interface PastoDropdown {
  id: number
  nome: string
  ativo?: boolean
}

export type AnimalViewMode = 'cards' | 'table'
