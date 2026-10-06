import { Beef, Clock3, CreditCard, Sprout } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function DashboardPage() {
  const navigate = useNavigate()
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

      <section className="dashboard-payables-section" aria-label="Resumo de contas a pagar">
        <div className="dashboard-payables-summary">
          <div className="summary-icon">
            <CreditCard size={20} aria-hidden="true" />
          </div>
          <div>
            <span>A pagar</span>
            <strong>{currencyFormatter.format(dashboard.contasPagarResumo.totalAPagar)}</strong>
            <p>
              {currencyFormatter.format(dashboard.contasPagarResumo.totalVencido)} vencidos ·{' '}
              {numberFormatter.format(dashboard.contasPagarResumo.quantidadeVencidas)} parcelas
            </p>
            <small>Proximos 7 dias: {currencyFormatter.format(dashboard.contasPagarResumo.valorProximos7Dias)}</small>
          </div>
          <button type="button" className="secondary-action" onClick={() => navigate('/a-pagar')}>
            Ver contas
          </button>
        </div>

        <div className="dashboard-payables-list">
          <div className="section-heading">
            <div>
              <h2>Proximos vencimentos</h2>
            </div>
          </div>
          {dashboard.contasPagarResumo.proximosVencimentos.length === 0 ? (
            <p className="dashboard-payables-empty">Nenhum vencimento aberto encontrado.</p>
          ) : (
            dashboard.contasPagarResumo.proximosVencimentos.slice(0, 5).map((item) => (
              <button
                type="button"
                className="dashboard-payable-item"
                key={`${item.contaPagarId}-${item.dataVencimento}`}
                onClick={() => navigate(`/a-pagar?conta=${item.contaPagarId}`)}
              >
                <span>{item.descricao}</span>
                <strong>{currencyFormatter.format(item.valor)}</strong>
                <small>{dateFormatter.format(new Date(`${item.dataVencimento}T00:00:00Z`))}</small>
              </button>
            ))
          )}
        </div>
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
