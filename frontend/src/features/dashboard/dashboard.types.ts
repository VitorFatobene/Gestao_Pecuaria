import { type LucideIcon } from 'lucide-react'

export interface DashboardApiAnimal {
  id: number
  codigoAnimal: string
  raca: string
  pesoKg: number
  status: string
  pastoNome: string
}

export interface DashboardApiMovement {
  tipo: string
  descricao: string
  data: string
  valor?: number
}

export interface DashboardApiQuote {
  valorArroba: number
  uf: string
  praca: string
  atualizado: string
}

export interface FinancialChartData {
  mes: string
  receitas: number
  despesas: number
}

export interface DashboardApiResponse {
  totalAnimais: number
  totalPastos: number
  lucroMes: number
  totalVendas: number
  cotacaoBoi: DashboardApiQuote | null
  animaisDestaque: DashboardApiAnimal[]
  movimentacoesRecentes: DashboardApiMovement[]
  evolucaoFinanceira: FinancialChartData[]
}

export type DashboardStatus = 'loading' | 'success' | 'error'
export type SummaryTrend = 'up' | 'down' | 'stable'

export type SummaryCardData = {
  title: string
  value: string
  indicator: string
  trend: SummaryTrend
  icon: LucideIcon
}

export type FinancialPoint = FinancialChartData

export type RecentMovement = {
  title: string
  description: string
  meta: string
  tone: 'sale' | 'animal' | 'money' | 'pasture'
  icon: LucideIcon
}

export type FeaturedAnimal = {
  id: string
  identification: string
  name: string
  category: string
  age: string
  weight: string
  status: 'Disponivel' | 'Prenhe' | 'Em engorda' | string
}

export type QuickAction = {
  label: string
  path: string
  icon: LucideIcon
}

export type DashboardViewData = {
  summaryCards: SummaryCardData[]
  financialData: FinancialPoint[]
  recentMovements: RecentMovement[]
  featuredAnimals: FeaturedAnimal[]
}
