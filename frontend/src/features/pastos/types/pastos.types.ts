export interface Pasto {
  id: number
  nome: string
  areaHectares: number
  descricao?: string | null
  ativo: boolean
  criadoEm?: string
  animaisAtivos?: number
}

export interface PastoRequestDTO {
  nome: string
  areaHectares: number
  descricao?: string
  ativo?: boolean
}

export interface AnimalPasto {
  id: number
  codigoAnimal: number
  raca: string
  sexo?: string | null
  pesoKg?: number | null
  status?: string | null
}

export type PastoStatusFilter = 'todos' | 'ativos' | 'inativos'

export type PastoViewMode = 'cards' | 'table'
