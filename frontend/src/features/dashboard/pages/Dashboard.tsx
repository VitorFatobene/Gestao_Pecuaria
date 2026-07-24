import { FeaturedAnimalsTable } from '../components/FeaturedAnimalsTable'
import { FinancialChart } from '../components/FinancialChart'
import { QuickActions } from '../components/QuickActions'
import { RecentMovements } from '../components/RecentMovements'
import { SummaryCard } from '../components/SummaryCard'
import { getDashboardData } from '../services/dashboardService'

export function Dashboard() {
  const dashboardData = getDashboardData()

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
