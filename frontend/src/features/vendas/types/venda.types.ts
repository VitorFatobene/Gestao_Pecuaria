export interface Venda {
  id: number
  animalId: number
  codigoAnimal: number | string
  nomeComprador: string
  valorVenda: number
  dataVenda: string
  pesoKgVenda: number
  pesoArrobaVenda: number
  criadoEm?: string
}

export interface VendaRequest {
  animalId: number
  nomeComprador: string
  valorVenda: number
  dataVenda: string
  pesoKgVenda: number
}

export interface AnimalParaVenda {
  id: number
  codigoAnimal: string | number
  raca: string
  pesoKg: number
  status: string
  pasto?: {
    id: number
    nome: string
  }
}

export interface FiltroVenda {
  inicio?: string
  fim?: string
}
