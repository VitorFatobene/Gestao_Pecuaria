import { useEffect, useState } from 'react'
import { DashboardHero } from './components/DashboardHero'
import { FeaturedAnimalsTable } from './components/FeaturedAnimalsTable'
import { FinancialChart } from './components/FinancialChart'
import { QuickActions } from './components/QuickActions'
import { RecentMovements } from './components/RecentMovements'
import { SummaryCard } from './components/SummaryCard'
import { dashboardMock, mockQuickActions } from './dashboard.mock'
import { getDashboardData, mapDashboardResponse } from './dashboardService'
import { type DashboardStatus, type DashboardViewData } from './dashboard.types'

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardViewData>(dashboardMock)
  const [status, setStatus] = useState<DashboardStatus>('loading')

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const apiData = await getDashboardData()

        if (isMounted) {
          setDashboard(mapDashboardResponse(apiData))
          setStatus('success')
        }
      } catch {
        if (isMounted) {
          setDashboard(dashboardMock)
          setStatus('error')
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const isLoading = status === 'loading'

  return (
    <div className="dashboard-page">
      <DashboardHero />

      {status === 'error' && (
        <div className="dashboard-data-alert" role="status">
          Dados demonstrativos exibidos porque nao foi possivel carregar o endpoint /dashboard.
        </div>
      )}

      <section className="summary-grid" aria-label="Resumo da fazenda">
        {dashboard.summaryCards.map((item) => (
          <SummaryCard isLoading={isLoading} item={item} key={item.title} />
        ))}
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-primary-column">
          <FinancialChart data={dashboard.financialData} />
          <FeaturedAnimalsTable animals={dashboard.featuredAnimals} isLoading={isLoading} />
        </div>

        <aside className="dashboard-secondary-column" aria-label="Atividades e atalhos">
          <RecentMovements items={dashboard.recentMovements} isLoading={isLoading} />
          <QuickActions items={mockQuickActions} />
        </aside>
      </section>
    </div>
  )
}
