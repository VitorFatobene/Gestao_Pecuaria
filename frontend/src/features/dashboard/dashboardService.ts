import { api } from '../../services/api'
import { dashboardMock } from './dashboard.mock'
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
    recentMovements:
      data.movimentacoesRecentes?.length > 0
        ? data.movimentacoesRecentes.slice(0, 4).map(mapRecentMovement)
        : dashboardMock.recentMovements,
    featuredAnimals:
      data.animaisDestaque?.length > 0
        ? data.animaisDestaque.slice(0, 3).map(mapFeaturedAnimal)
        : dashboardMock.featuredAnimals,
  }
}

function buildSummaryCards(data: DashboardApiResponse): SummaryCardData[] {
  return [
    {
      ...dashboardMock.summaryCards[0],
      value: numberFormatter.format(data.totalAnimais ?? 0),
    },
    {
      ...dashboardMock.summaryCards[1],
      value: numberFormatter.format(data.totalPastos ?? 0),
    },
    {
      ...dashboardMock.summaryCards[2],
      value: currencyFormatter.format(data.lucroMes ?? 0),
      indicator: data.totalVendas != null ? `${numberFormatter.format(data.totalVendas)} vendas` : '18,6%',
    },
    {
      ...dashboardMock.summaryCards[3],
      value: data.cotacaoBoi ? currencyFormatter.format(data.cotacaoBoi.valorArroba) : dashboardMock.summaryCards[3].value,
      indicator: data.cotacaoBoi ? `${data.cotacaoBoi.praca || data.cotacaoBoi.uf} atualizado` : dashboardMock.summaryCards[3].indicator,
    },
  ]
}

function mapRecentMovement(item: DashboardApiResponse['movimentacoesRecentes'][number]): RecentMovement {
  const isSale = item.tipo === 'VENDA'
  const value = item.valor != null ? currencyFormatter.format(item.valor) : formatDate(item.data)

  return {
    title: isSale ? 'Venda realizada' : 'Novo animal cadastrado',
    description: item.descricao,
    meta: value,
    tone: isSale ? 'sale' : 'animal',
    icon: dashboardMock.recentMovements[isSale ? 0 : 1].icon,
  }
}

function mapFeaturedAnimal(item: DashboardApiResponse['animaisDestaque'][number]): FeaturedAnimal {
  return {
    id: String(item.id),
    identification: item.codigoAnimal,
    name: item.raca || 'Animal',
    category: inferCategory(item.status),
    age: 'Nao informado',
    weight: `${numberFormatter.format(item.pesoKg ?? 0)} kg`,
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
  }).format(new Date(`${date}T00:00:00`))
}
