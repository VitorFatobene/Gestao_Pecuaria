import { RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationPopup } from '../../components/NotificationPopup'
import { PeriodSummary } from './components/PeriodSummary'
import { SaleDetailsDrawer } from './components/SaleDetailsDrawer'
import { SalesChart } from './components/SalesChart'
import { SalesFilters } from './components/SalesFilters'
import { SalesHero } from './components/SalesHero'
import { SalesSummaryCards } from './components/SalesSummaryCards'
import { SalesTable } from './components/SalesTable'
import { buscarVendasPorData, listarVendas } from './services/vendasService'
import {
  type PeriodSummaryData,
  type SalesChartPoint,
  type SalesFilterParams,
  type SalesSummary,
  type Venda,
} from './types/vendas.types'
import { getSaleStatus } from './utils/salesFormatters'

export function VendasPage() {
  const navigate = useNavigate()
  const [vendas, setVendas] = useState<Venda[]>([])
  const [filters, setFilters] = useState<SalesFilterParams>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null)

  const filteredVendas = useMemo(() => applyClientFilters(vendas, filters), [vendas, filters])
  const summary = useMemo(() => buildSalesSummary(filteredVendas), [filteredVendas])
  const periodSummary = useMemo(() => buildPeriodSummary(filteredVendas), [filteredVendas])
  const chartData = useMemo(() => buildChartData(filteredVendas), [filteredVendas])

  const loadVendas = useCallback(async (nextFilters: SalesFilterParams = {}, showSuccessPopup = false) => {
    try {
      setIsLoading(true)
      setError(null)

      const data =
        nextFilters.inicio && nextFilters.fim
          ? await buscarVendasPorData(nextFilters.inicio, nextFilters.fim)
          : await listarVendas()

      setVendas(data)
      if (showSuccessPopup) {
        setFeedback('Dados atualizados com sucesso.')
      }
    } catch {
      setError('Nao foi possivel carregar as vendas.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadVendas()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadVendas])

  async function handleFilter(nextFilters: SalesFilterParams) {
    setFeedback(null)
    setFilters(nextFilters)
    await loadVendas(nextFilters)
  }

  async function handleClearFilters() {
    setFeedback(null)
    setFilters({})
    await loadVendas({})
  }

  async function handleRefresh() {
    await loadVendas(filters, true)
  }

  return (
    <div className="sales-page">
      <SalesHero onCreateSale={() => navigate('/vendas/nova')} />

      <SalesSummaryCards summary={summary} isLoading={isLoading} />

      <SalesFilters
        filters={filters}
        animais={vendas}
        isLoading={isLoading}
        onFilter={handleFilter}
        onClear={handleClearFilters}
      />

      <div className="sales-list-header">
        <div>
          <span>{filteredVendas.length}</span>
          <p>{filteredVendas.length === 1 ? 'venda encontrada' : 'vendas encontradas'}</p>
        </div>
        <button type="button" className="secondary-action" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCcw size={16} aria-hidden="true" />
          Atualizar
        </button>
      </div>

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
      {error && (
        <div className="sales-error" role="alert">
          {error}
        </div>
      )}

      <section className="sales-content-grid">
        <div className="sales-primary-column">
          <SalesChart data={chartData} isLoading={isLoading} />
        </div>

        <aside className="sales-secondary-column" aria-label="Resumo comercial">
          <PeriodSummary summary={periodSummary} isLoading={isLoading} />
        </aside>
      </section>

      {isLoading ? (
        <SalesTableSkeleton />
      ) : filteredVendas.length === 0 ? (
        <section className="sales-empty">
          <h2>Nenhuma venda encontrada.</h2>
          <p>Registre uma nova venda ou ajuste os filtros aplicados.</p>
        </section>
      ) : (
        <SalesTable
          vendas={filteredVendas}
          onViewDetails={setSelectedVenda}
          onOpenPage={(venda) => navigate(`/vendas/${venda.id}`)}
        />
      )}

      {selectedVenda && (
        <SaleDetailsDrawer
          venda={selectedVenda}
          onClose={() => setSelectedVenda(null)}
          onOpenPage={(venda) => navigate(`/vendas/${venda.id}`)}
        />
      )}
    </div>
  )
}

function SalesTableSkeleton() {
  return (
    <section className="sales-table-card" aria-label="Carregando vendas">
      <div className="sales-table-skeleton">
        {Array.from({ length: 7 }).map((_, index) => (
          <i className="skeleton-line skeleton-row" key={index} />
        ))}
      </div>
    </section>
  )
}

function applyClientFilters(vendas: Venda[], filters: SalesFilterParams) {
  const normalizedSearch = normalizeText(filters.busca)

  return vendas.filter((venda) => {
    const saleStatus = getSaleStatus(venda)
    const saleId = formatSearchSaleId(venda.id)

    const matchesPeriod =
      (!filters.inicio || venda.dataVenda >= filters.inicio) && (!filters.fim || venda.dataVenda <= filters.fim)
    const matchesAnimal = !filters.animalId || venda.animalId === filters.animalId
    const matchesStatus = !filters.status || saleStatus === filters.status
    const matchesSearch =
      !normalizedSearch ||
      normalizeText(venda.nomeComprador).includes(normalizedSearch) ||
      normalizeText(venda.codigoAnimal).includes(normalizedSearch) ||
      normalizeText(venda.racaAnimal).includes(normalizedSearch) ||
      normalizeText(venda.id).includes(normalizedSearch) ||
      normalizeText(saleId).includes(normalizedSearch)

    return matchesPeriod && matchesAnimal && matchesStatus && matchesSearch
  })
}

function buildSalesSummary(vendas: Venda[]): SalesSummary {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const faturamento = vendas.reduce((total, venda) => total + venda.valorVenda, 0)
  const vendasMes = vendas.filter((venda) => {
    const date = new Date(`${venda.dataVenda}T00:00:00Z`)
    return date.getUTCFullYear() === currentYear && date.getUTCMonth() === currentMonth
  }).length
  const animaisVendidos = new Set(vendas.map((venda) => venda.animalId)).size

  return {
    vendasMes,
    faturamento,
    ticketMedio: vendas.length > 0 ? faturamento / vendas.length : 0,
    animaisVendidos,
  }
}

function buildPeriodSummary(vendas: Venda[]): PeriodSummaryData {
  const vendasConcluidas = vendas.filter((venda) => getSaleStatus(venda) === 'CONCLUIDA').length

  return {
    totalVendas: vendas.length,
    faturamentoTotal: vendas.reduce((total, venda) => total + venda.valorVenda, 0),
    animaisVendidos: new Set(vendas.map((venda) => venda.animalId)).size,
    pesoTotalVendido: vendas.reduce((total, venda) => total + venda.pesoKgVenda, 0),
    conversao: vendas.length > 0 ? (vendasConcluidas / vendas.length) * 100 : 0,
  }
}

function buildChartData(vendas: Venda[]): SalesChartPoint[] {
  const now = new Date()
  const points = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(Date.UTC(now.getFullYear(), now.getMonth() - (5 - index), 1))
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`

    return {
      key,
      mes: new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' })
        .format(date)
        .replace('.', ''),
      faturamento: 0,
    }
  })

  const totals = new Map(points.map((point) => [point.key, point]))

  vendas.forEach((venda) => {
    const key = venda.dataVenda.slice(0, 7)
    const point = totals.get(key)

    if (point) {
      point.faturamento += venda.valorVenda
    }
  })

  return points.map(({ mes, faturamento }) => ({ mes, faturamento }))
}

function formatSearchSaleId(id: number) {
  return `VEN-${String(id).padStart(6, '0')}`
}

function normalizeText(value?: string | number | null) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
