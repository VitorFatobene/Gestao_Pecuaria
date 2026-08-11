export type LoteStatus = 'ABERTO' | 'VENDIDO' | 'CANCELADO'

export interface LoteResumo {
  id: number
  nome: string
  status: LoteStatus
}

export interface Lote {
  id: number
  nome: string
  descricao?: string
  status: LoteStatus
  quantidadeAnimais: number
  pesoTotalKg: number
  animais: LoteAnimal[]
  criadoEm?: string
}

export interface LoteAnimal {
  id: number
  codigoAnimal: string
  raca: string
  sexo?: 'MACHO' | 'FEMEA'
  pesoKg: number
  status: 'ATIVO' | 'INATIVO' | 'VENDIDO'
}

export interface CreateLoteRequest {
  nome: string
  descricao?: string
}

export interface AddAnimalsToLoteRequest {
  animalIds: number[]
}
