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
  month: string
  revenue: number
  expense: number
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
