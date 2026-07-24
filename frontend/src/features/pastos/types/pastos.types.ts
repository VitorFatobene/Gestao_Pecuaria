export interface Pasto {
  id: number
  nome: string
  areaHectares: number
  descricao?: string | null
  ativo: boolean
  criadoEm?: string
}

export interface PastoRequestDTO {
  nome: string
  areaHectares: number
  descricao?: string
  ativo?: boolean
}

export type PastoStatusFilter = 'todos' | 'ativos' | 'inativos'

export type PastoViewMode = 'cards' | 'table'
