import {
  Beef,
  CircleDollarSign,
  Map,
  Plus,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { FeaturedAnimalsTable } from '../components/FeaturedAnimalsTable'
import { FinancialChart } from '../components/FinancialChart'
import { QuickActions } from '../components/QuickActions'
import { RecentMovements } from '../components/RecentMovements'
import { SummaryCard } from '../components/SummaryCard'
import { getDashboardData } from '../services/dashboardService'
import {
  type DashboardResponse,
  type QuickAction,
  type SummaryCardData,
} from '../types/dashboard.types'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

const quickActions: QuickAction[] = [
  { label: 'Novo animal', path: '/animais', icon: Plus },
  { label: 'Registrar venda', path: '/vendas', icon: ShoppingCart },
  { label: 'Ver pastos', path: '/pastos', icon: Map },
  { label: 'Financeiro', path: '/financeiro', icon: CircleDollarSign },
]

export function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const data = await getDashboardData()

        if (isMounted) {
          setData(data)
          setError(null)
        }
      } catch {
        if (isMounted) {
          setError('Nao foi possivel carregar os dados do dashboard. Tente novamente mais tarde.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <div className="route-loading">Carregando dados da fazenda...</div>
  }

  if (error || !data) {
    return (
      <section className="dashboard-card dashboard-alert" role="alert">
        <h1>Dashboard</h1>
        <p>{error}</p>
      </section>
    )
  }

  const summary = buildSummary(data)
  const valorCotacaoBoi = data.cotacaoBoi?.valorArroba ?? 0

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span>Painel operacional</span>
          <h1>Visao geral da fazenda</h1>
          <p>
            Indicadores essenciais para acompanhar rebanho, pastos, vendas e
            desempenho financeiro.
          </p>
        </div>
      </section>

      <section className="summary-grid" aria-label="Resumo da fazenda">
        {summary.map((item) => (
          <SummaryCard item={item} key={item.title} />
        ))}
      </section>

      <section className="dashboard-grid">
        <FinancialChart lucroMes={data.lucroMes} cotacaoBoi={valorCotacaoBoi} />
        <QuickActions items={quickActions} />
        <RecentMovements items={data.movimentacoesRecentes} />
        <FeaturedAnimalsTable animals={data.animaisDestaque} />
      </section>
    </div>
  )
}

function buildSummary(data: DashboardResponse): SummaryCardData[] {
  return [
    {
      title: 'Rebanho ativo',
      value: numberFormatter.format(data.totalAnimais),
      description: 'Animais ativos no sistema',
      trend: 'stable',
      icon: Beef,
    },
    {
      title: 'Lucro consolidado',
      value: currencyFormatter.format(data.lucroMes),
      description: 'Resumo financeiro atual',
      trend: data.lucroMes >= 0 ? 'up' : 'down',
      icon: TrendingUp,
    },
    {
      title: 'Pastos',
      value: numberFormatter.format(data.totalPastos),
      description: 'Pastos cadastrados',
      trend: 'stable',
      icon: Map,
    },
    {
      title: 'Cotacao do boi',
      value: data.cotacaoBoi ? `${currencyFormatter.format(data.cotacaoBoi.valorArroba)}/@` : 'Indisponivel',
      description: data.cotacaoBoi
        ? `${data.cotacaoBoi.uf} - atualizado em ${formatDateTime(data.cotacaoBoi.atualizado)}`
        : `${numberFormatter.format(data.totalVendas)} vendas efetuadas`,
      trend: 'stable',
      icon: CircleDollarSign,
    },
  ]
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
