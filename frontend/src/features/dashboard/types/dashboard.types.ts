import { type LucideIcon } from 'lucide-react'

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

export type RecentMovement = {
  id: number
  title: string
  description: string
  date: string
  amount?: string
  type: 'animal' | 'sale' | 'finance'
}

export type QuickAction = {
  label: string
  path: string
  icon: LucideIcon
}

export type FeaturedAnimal = {
  id: number
  brinco: string
  categoria: string
  peso: string
  status: string
  pasto: string
}

export type DashboardData = {
  summary: SummaryCardData[]
  financialSeries: FinancialPoint[]
  recentMovements: RecentMovement[]
  quickActions: QuickAction[]
  featuredAnimals: FeaturedAnimal[]
}

export type DashboardResponse = {
  totalAnimais: number
  totalPastos: number
  lucroMes: number
  totalVendas: number
  cotacaoBoi: number
  animaisDestaque: AnimalDestaqueResponse[]
  movimentacoesRecentes: MovimentacaoRecenteResponse[]
}

export type AnimalDestaqueResponse = {
  id: number
  codigoAnimal: string
  raca: string
  pesoKg: number
  status: string
  pastoNome: string
}

export type MovimentacaoRecenteResponse = {
  tipo: 'VENDA' | 'COMPRA' | 'TROCA_PASTO' | string
  descricao: string
  data: string
  valor?: number | null
}
