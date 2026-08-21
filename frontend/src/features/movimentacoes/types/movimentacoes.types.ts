export interface AnimalResumo {
  id: number
  codigoAnimal: string
  raca: string
  pesoKg: number
  status: string
}

export interface PastoResumoMovimentacao {
  id: number
  nome: string
  areaHectares?: number | null
  descricao?: string | null
  ativo?: boolean | null
}

export interface MovimentacaoAnimal {
  id: number
  animal: AnimalResumo
  pasto: PastoResumoMovimentacao
  dataEntrada: string
  dataSaida?: string | null
  diasPermanencia: number
  atual: boolean
}

export interface MovimentacaoFilters {
  animalId?: number
  pastoId?: number
  inicio?: string
  fim?: string
}
