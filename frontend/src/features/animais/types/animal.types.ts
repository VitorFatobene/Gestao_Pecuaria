export type AnimalStatus = 'ATIVO' | 'INATIVO' | 'VENDIDO'

export type SexoAnimal = 'MACHO' | 'FEMEA'

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
  codigo?: string
  pastoId?: number
  status?: string
  dataInicio?: string
  dataFim?: string
}

export interface PastoDropdown {
  id: number
  nome: string
  ativo?: boolean
}

export type AnimalViewMode = 'cards' | 'table'

