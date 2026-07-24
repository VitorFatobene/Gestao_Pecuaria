import { useEffect, useState } from 'react'
import { FeaturedAnimalsTable } from '../components/FeaturedAnimalsTable'
import { FinancialChart } from '../components/FinancialChart'
import { QuickActions } from '../components/QuickActions'
import { RecentMovements } from '../components/RecentMovements'
import { SummaryCard } from '../components/SummaryCard'
import { getDashboardData } from '../services/dashboardService'
import { type DashboardData } from '../types/dashboard.types'

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const data = await getDashboardData()

        if (isMounted) {
          setDashboardData(data)
          setErrorMessage('')
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Nao foi possivel carregar os dados do dashboard.')
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
    return <div className="route-loading">Carregando dashboard...</div>
  }

  if (errorMessage || !dashboardData) {
    return (
      <section className="page-placeholder">
        <h1>Dashboard</h1>
        <p>{errorMessage}</p>
      </section>
    )
  }

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
        {dashboardData.summary.map((item) => (
          <SummaryCard item={item} key={item.title} />
        ))}
      </section>

      <section className="dashboard-grid">
        <FinancialChart data={dashboardData.financialSeries} />
        <QuickActions items={dashboardData.quickActions} />
        <RecentMovements items={dashboardData.recentMovements} />
        <FeaturedAnimalsTable animals={dashboardData.featuredAnimals} />
      </section>
    </div>
  )
}
