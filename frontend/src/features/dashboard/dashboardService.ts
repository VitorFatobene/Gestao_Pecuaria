import { Beef, CircleDollarSign, LineChart, ShoppingCart, Wheat } from 'lucide-react'
import { api } from '../../services/api'
import {
  type DashboardApiResponse,
  type DashboardManejo,
  type DashboardViewData,
  type FeaturedAnimal,
  type RecentMovement,
  type SummaryCardData,
} from './dashboard.types'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

export const emptyDashboardData: DashboardViewData = {
  summaryCards: [
    { icon: Beef, title: 'Total de animais', value: '0', indicator: 'Animais ativos', trend: 'stable' },
    { icon: Wheat, title: 'Pastos ativos', value: '0', indicator: 'Pastos cadastrados', trend: 'stable' },
    { icon: CircleDollarSign, title: 'Vendas do mês', value: currencyFormatter.format(0), indicator: '0 vendas', trend: 'stable' },
    { icon: LineChart, title: 'Cotação do boi (@)', value: '—', indicator: 'Cotação indisponível', trend: 'stable' },
  ],
  financialData: [],
  recentMovements: [],
  featuredAnimals: [],
  contasPagarResumo: {
    totalAPagar: 0,
    totalVencido: 0,
    quantidadeVencidas: 0,
    valorProximos7Dias: 0,
    proximosVencimentos: [],
  },
}

export const getDashboardData = async (): Promise<DashboardApiResponse> => {
  const response = await api.get<DashboardApiResponse>('/dashboard')
  return response.data
}

export const getDashboardManejoData = async (): Promise<DashboardManejo> => {
  const response = await api.get<DashboardManejo>('/dashboard/manejo')
  return response.data
}

export function mapDashboardResponse(data: DashboardApiResponse): DashboardViewData {
  return {
    summaryCards: buildSummaryCards(data),
    financialData: data.evolucaoFinanceira ?? [],
    recentMovements: (data.movimentacoesRecentes ?? []).slice(0, 5).map(mapRecentMovement),
    featuredAnimals: (data.animaisDestaque ?? []).slice(0, 3).map(mapFeaturedAnimal),
    contasPagarResumo: {
      totalAPagar: Number(data.totalAPagar ?? 0),
      totalVencido: Number(data.totalVencido ?? 0),
      quantidadeVencidas: Number(data.quantidadeVencidas ?? 0),
      valorProximos7Dias: Number(data.valorProximos7Dias ?? 0),
      proximosVencimentos: data.proximosVencimentos ?? [],
    },
  }
}

function buildSummaryCards(data: DashboardApiResponse): SummaryCardData[] {
  return [
    {
      icon: Beef,
      title: 'Total de animais',
      value: numberFormatter.format(data.totalAnimais ?? 0),
      indicator: 'Animais ativos',
      trend: 'stable',
    },
    {
      icon: Wheat,
      title: 'Pastos ativos',
      value: numberFormatter.format(data.totalPastos ?? 0),
      indicator: 'Pastos cadastrados',
      trend: 'stable',
    },
    {
      icon: CircleDollarSign,
      title: 'Vendas do mês',
      value: currencyFormatter.format(data.lucroMes ?? 0),
      indicator: `${numberFormatter.format(data.totalVendas ?? 0)} vendas`,
      trend: 'stable',
    },
    {
      icon: LineChart,
      title: 'Cotação do boi (@)',
      value: data.cotacaoBoi ? currencyFormatter.format(data.cotacaoBoi.valorArroba) : '—',
      indicator: data.cotacaoBoi ? `${data.cotacaoBoi.praca || data.cotacaoBoi.uf} atualizado` : 'Cotação indisponível',
      trend: 'stable',
    },
  ]
}

function mapRecentMovement(item: DashboardApiResponse['movimentacoesRecentes'][number]): RecentMovement {
  const movementPresentation = item.tipo === 'VENDA'
    ? { title: 'Venda realizada', tone: 'sale' as const, icon: ShoppingCart }
    : { title: 'Compra registrada', tone: 'animal' as const, icon: Beef }
  const details = [formatDate(item.data), item.valor != null ? currencyFormatter.format(item.valor) : null]
    .filter(Boolean)
    .join(' · ')

  return {
    title: movementPresentation.title,
    description: item.descricao,
    meta: details,
    tone: movementPresentation.tone,
    icon: movementPresentation.icon,
  }
}

function mapFeaturedAnimal(item: DashboardApiResponse['animaisDestaque'][number]): FeaturedAnimal {
  return {
    id: String(item.id),
    identification: item.codigoAnimal,
    name: item.raca || 'Animal',
    category: inferCategory(item.status),
    age: 'Nao informado',
    pesoKg: item.pesoKg ?? null,
    status: formatStatus(item.status),
  }
}

function inferCategory(status: string) {
  return status === 'ATIVO' ? 'Bovino' : formatStatus(status)
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
