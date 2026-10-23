import { RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationPopup } from '../../components/NotificationPopup'
import { ReceiveSaleModal } from './components/ReceiveSaleModal'
import { SaleDetailsDrawer } from './components/SaleDetailsDrawer'
import { SalesChart } from './components/SalesChart'
import { SalesFilters } from './components/SalesFilters'
import { SalesHero } from './components/SalesHero'
import { SalesSummaryCards } from './components/SalesSummaryCards'
import { SalesTable } from './components/SalesTable'
import { buscarVisaoGeralVendas, listarVendas, receberVenda } from './services/vendasService'
import {
  type RegistrarRecebimentoVendaRequest,
  type SalesFilterParams,
  type SalesSummary,
  type SalesOverview,
  type Venda,
} from './types/vendas.types'

export function VendasPage() {
  const navigate = useNavigate()
  const [vendas, setVendas] = useState<Venda[]>([])
  const [filters, setFilters] = useState<SalesFilterParams>({})
  const [page, setPage] = useState(0)
  const [pagination, setPagination] = useState({ totalElements: 0, totalPages: 0, first: true, last: true })
  const [overview, setOverview] = useState<SalesOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null)
  const [saleToReceive, setSaleToReceive] = useState<Venda | null>(null)
  const [isReceivingSale, setIsReceivingSale] = useState(false)

  const summary = useMemo(() => overview ? toSalesSummary(overview) : emptySummary(), [overview])
  const chartData = useMemo(() => overview?.faturamentoMensal ?? [], [overview])

  const loadVendas = useCallback(async (
    nextFilters: SalesFilterParams,
    nextPage: number,
    showSuccessPopup = false,
    refreshOverview = true,
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const [data, nextOverview] = await Promise.all([
        listarVendas({ ...nextFilters, page: nextPage, size: 20 }),
        refreshOverview ? buscarVisaoGeralVendas(nextFilters) : Promise.resolve(null),
      ])

      if (data.totalPages > 0 && nextPage >= data.totalPages) {
        setPage(data.totalPages - 1)
        await loadVendas(nextFilters, data.totalPages - 1, showSuccessPopup, refreshOverview)
        return
      }

      setVendas(data.content)
      setPagination(data)
      if (nextOverview) {
        setOverview(nextOverview)
      }
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
      void loadVendas({}, 0)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadVendas])

  async function handleFilter(nextFilters: SalesFilterParams) {
    setFeedback(null)
    setFilters(nextFilters)
    setPage(0)
    await loadVendas(nextFilters, 0)
  }

  async function handleClearFilters() {
    setFeedback(null)
    setFilters({})
    setPage(0)
    await loadVendas({}, 0)
  }

  async function handleRefresh() {
    await loadVendas(filters, page, true)
  }

  async function handlePageChange(nextPage: number) {
    if (nextPage < 0 || nextPage >= pagination.totalPages || nextPage === page) {
      return
    }
    setPage(nextPage)
    await loadVendas(filters, nextPage, false, false)
  }

  async function handleReceiveSale(data: RegistrarRecebimentoVendaRequest) {
    if (!saleToReceive) {
      return
    }

    try {
      setIsReceivingSale(true)
      setError(null)
      const updatedVenda = await receberVenda(saleToReceive.id, data)
      setSelectedVenda((current) => (current?.id === updatedVenda.id ? updatedVenda : current))
      setSaleToReceive(null)
      setFeedback('Recebimento registrado com sucesso.')
      await loadVendas(filters, page)
    } catch {
      setError('Nao foi possivel registrar o recebimento da venda.')
    } finally {
      setIsReceivingSale(false)
    }
  }

  return (
    <div className="sales-page">
      <SalesHero onCreateSale={() => navigate('/vendas/nova')} onCreateLoteSale={() => navigate('/vendas/lote/nova')} />

      <SalesSummaryCards summary={summary} isLoading={isLoading} />

      <SalesFilters
        filters={filters}
        animais={overview?.animais ?? []}
        isLoading={isLoading}
        onFilter={handleFilter}
        onClear={handleClearFilters}
      />

      <div className="sales-list-header">
        <div>
          <span>{pagination.totalElements}</span>
          <p>{pagination.totalElements === 1 ? 'venda encontrada' : 'vendas encontradas'}</p>
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
      </section>

      {isLoading ? (
        <SalesTableSkeleton />
      ) : pagination.totalElements === 0 ? (
        <section className="sales-empty">
          <h2>Nenhuma venda encontrada.</h2>
          <p>Registre uma nova venda ou ajuste os filtros aplicados.</p>
        </section>
      ) : (
        <SalesTable
          vendas={vendas}
          onViewDetails={setSelectedVenda}
          onOpenPage={(venda) => navigate(`/vendas/${venda.id}`)}
        />
      )}

      {pagination.totalPages > 1 && (
        <nav className="sales-pagination" aria-label="Paginação de vendas">
          <button type="button" className="secondary-action" onClick={() => void handlePageChange(page - 1)} disabled={pagination.first || isLoading}>
            Anterior
          </button>
          <span>Página {page + 1} de {pagination.totalPages}</span>
          <button type="button" className="secondary-action" onClick={() => void handlePageChange(page + 1)} disabled={pagination.last || isLoading}>
            Próxima
          </button>
        </nav>
      )}

      {selectedVenda && (
        <SaleDetailsDrawer
          venda={selectedVenda}
          onClose={() => setSelectedVenda(null)}
          onOpenPage={(venda) => navigate(`/vendas/${venda.id}`)}
          onReceiveSale={setSaleToReceive}
        />
      )}

      {saleToReceive && (
        <ReceiveSaleModal
          venda={saleToReceive}
          isSaving={isReceivingSale}
          onClose={() => setSaleToReceive(null)}
          onConfirm={handleReceiveSale}
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

function toSalesSummary(overview: SalesOverview): SalesSummary {
  return {
    vendasMes: overview.vendasMes,
    faturamento: overview.faturamento,
    ticketMedio: overview.ticketMedio,
    animaisVendidos: overview.animaisVendidos,
  }
}

function emptySummary(): SalesSummary {
  return { vendasMes: 0, faturamento: 0, ticketMedio: 0, animaisVendidos: 0 }
}
