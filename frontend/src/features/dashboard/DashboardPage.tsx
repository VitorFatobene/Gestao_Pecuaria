import { Beef, Clock3, Sprout } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnimaisMaiorPermanencia } from './components/AnimaisMaiorPermanencia'
import { DashboardHero } from './components/DashboardHero'
import { FinancialChart } from './components/FinancialChart'
import { ManejoResumoCard } from './components/ManejoResumoCard'
import { PastosRotacaoCard } from './components/PastosRotacaoCard'
import { RecentMovements } from './components/RecentMovements'
import { SummaryCard } from './components/SummaryCard'
import { dashboardMock } from './dashboard.mock'
import { getDashboardData, getDashboardManejoData, mapDashboardResponse } from './dashboardService'
import { type DashboardManejo, type DashboardStatus, type DashboardViewData } from './dashboard.types'

const manejoInitialState: DashboardManejo = {
  pastosAtivos: 0,
  animaisEmPastos: 0,
  tempoMedioPermanencia: 0,
  animaisMaiorPermanencia: [],
  pastosRotacao: [],
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardViewData>(dashboardMock)
  const [manejo, setManejo] = useState<DashboardManejo>(manejoInitialState)
  const [status, setStatus] = useState<DashboardStatus>('loading')
  const [manejoStatus, setManejoStatus] = useState<DashboardStatus>('loading')

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const [apiData, manejoData] = await Promise.all([getDashboardData(), getDashboardManejoData()])

        if (isMounted) {
          setDashboard(mapDashboardResponse(apiData))
          setManejo(manejoData)
          setStatus('success')
          setManejoStatus('success')
        }
      } catch {
        if (isMounted) {
          setDashboard(dashboardMock)
          setManejo(manejoInitialState)
          setStatus('error')
          setManejoStatus('error')
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const isLoading = status === 'loading'
  const isManejoLoading = manejoStatus === 'loading'

  return (
    <div className="dashboard-page">
      <DashboardHero />

      {status === 'error' && (
        <div className="dashboard-data-alert" role="status">
          Dados demonstrativos exibidos porque não foi possível carregar os endpoints do dashboard.
        </div>
      )}

      <section className="summary-grid" aria-label="Resumo da fazenda">
        {dashboard.summaryCards.map((item) => (
          <SummaryCard isLoading={isLoading} item={item} key={item.title} />
        ))}
      </section>

      <section className="dashboard-main-grid" aria-label="Resumo operacional">
        <FinancialChart data={dashboard.financialData} />
        <RecentMovements items={dashboard.recentMovements} isLoading={isLoading} />
      </section>

      <section className="dashboard-manejo-section" aria-label="Manejo de pastagens">
        <div className="section-heading">
          <div>
            <span>Manejo de pastagens</span>
            <h2>Indicadores de rotação</h2>
          </div>
        </div>

        <div className="manejo-resumo-grid">
          <ManejoResumoCard
            title="Pastos ativos"
            value={numberFormatter.format(manejo.pastosAtivos)}
            detail="Áreas disponíveis para manejo"
            icon={Sprout}
            isLoading={isManejoLoading}
          />
          <ManejoResumoCard
            title="Animais em pastos"
            value={numberFormatter.format(manejo.animaisEmPastos)}
            detail="Movimentações abertas"
            icon={Beef}
            isLoading={isManejoLoading}
          />
          <ManejoResumoCard
            title="Tempo médio"
            value={formatDays(manejo.tempoMedioPermanencia)}
            detail="Permanência atual"
            icon={Clock3}
            isLoading={isManejoLoading}
          />
        </div>

        <div className="dashboard-manejo-grid">
          <AnimaisMaiorPermanencia animais={manejo.animaisMaiorPermanencia} isLoading={isManejoLoading} />
          <PastosRotacaoCard pastos={manejo.pastosRotacao} isLoading={isManejoLoading} />
        </div>
      </section>
    </div>
  )
}

function formatDays(days: number) {
  return days === 1 ? '1 dia' : `${numberFormatter.format(days)} dias`
}
