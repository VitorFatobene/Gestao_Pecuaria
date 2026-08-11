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
  criadoEm?: string
}

export interface CreateLoteRequest {
  nome: string
  descricao?: string
}

export interface AddAnimalsToLoteRequest {
  animalIds: number[]
}
