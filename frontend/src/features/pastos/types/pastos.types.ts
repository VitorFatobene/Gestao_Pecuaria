export interface Pasto {
  id: number
  nome: string
  areaHectares: number
  descricao?: string | null
  ativo: boolean
  criadoEm?: string
  animaisAtivos?: number
}

export type PastoOcupacaoStatus = 'NORMAL' | 'ATENCAO' | 'LOTADO'

export interface PastoResumo {
  id: number
  nome: string
  areaHectares: number
  capacidade: number
  quantidadeAnimais: number
  ocupacaoPercentual: number
  statusOcupacao: PastoOcupacaoStatus
  tempoMedioPermanencia: number
  maiorTempoPermanencia: number
  tipoPastagem: string
  descricao?: string | null
  ativo: boolean
  criadoEm?: string
}

export interface PastoOcupacao {
  pastoId: number
  quantidadeAnimais: number
  tempoMedioPermanencia: number
  maiorTempoPermanencia: number
}

export interface PastoAnimaisResumo {
  categoria: string
  quantidade: number
  pesoMedio: number
  idadeMedia: string
}

export interface PastoDetalhes {
  pasto: PastoResumo
  animaisAlocados: PastoAnimaisResumo[]
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

export type PastoTipoFilter = 'todos' | string

export type PastoViewMode = 'cards' | 'table'

export interface PastoFilterParams {
  busca?: string
  status?: PastoStatusFilter
  tipoPastagem?: PastoTipoFilter
}
