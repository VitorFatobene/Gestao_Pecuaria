import { type LucideIcon } from 'lucide-react'

export interface AnimalDestaque {
  id: number
  codigoAnimal: string
  raca: string
  pesoKg: number
  status: string
  pastoNome: string
}

export interface MovimentacaoRecente {
  tipo: string
  descricao: string
  data: string
  valor?: number
}

export interface DashboardResponse {
  totalAnimais: number
  totalPastos: number
  lucroMes: number
  totalVendas: number
  cotacaoBoi: number
  animaisDestaque: AnimalDestaque[]
  movimentacoesRecentes: MovimentacaoRecente[]
}

export type SummaryTrend = 'up' | 'down' | 'stable'

export type SummaryCardData = {
  title: string
  value: string
  description: string
  trend: SummaryTrend
  icon: LucideIcon
}

export type FinancialPoint = {
  label: string
  value: number
  kind: 'profit' | 'reference'
}

export type QuickAction = {
  label: string
  path: string
  icon: LucideIcon
}
