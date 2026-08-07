import { Plus, RefreshCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationPopup } from '../../../components/NotificationPopup'
import { VendaCard } from '../components/VendaCard'
import { VendaFilters } from '../components/VendaFilters'
import { VendaTable } from '../components/VendaTable'
import { buscarVendasPorData, listarVendas } from '../services/vendaService'
import { type FiltroVenda, type Venda } from '../types/venda.types'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ListaVendas() {
  const navigate = useNavigate()
  const [vendas, setVendas] = useState<Venda[]>([])
  const [filters, setFilters] = useState<FiltroVenda>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadVendas()
  }, [])

  const totalVendido = useMemo(
    () => vendas.reduce((total, venda) => total + venda.valorVenda, 0),
    [vendas],
  )

  const pesoTotalArroba = useMemo(
    () => vendas.reduce((total, venda) => total + venda.pesoArrobaVenda, 0),
    [vendas],
  )

  async function loadVendas(nextFilters: FiltroVenda = filters, showSuccessPopup = false) {
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
  }

  async function handleFilter(nextFilters: Required<FiltroVenda>) {
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
    <div className="vendas-page">
      <section className="vendas-page-header">
        <div>
          <span>Comercial</span>
          <h1>Gestao de Vendas</h1>
          <p>Consulte vendas realizadas, filtre por periodo e registre novas saidas do rebanho.</p>
        </div>
        <button type="button" className="primary-action" onClick={() => navigate('/vendas/nova')}>
          <Plus size={18} aria-hidden="true" />
          Nova Venda
        </button>
      </section>

      <section className="vendas-metrics" aria-label="Resumo das vendas exibidas">
        <VendaMetric label="Vendas exibidas" value={String(vendas.length)} />
        <VendaMetric label="Valor vendido" value={currencyFormatter.format(totalVendido)} />
        <VendaMetric label="Peso vendido" value={`${pesoTotalArroba.toLocaleString('pt-BR')} @`} />
      </section>

      <section className="vendas-toolbar">
        <VendaFilters filters={filters} isLoading={isLoading} onFilter={handleFilter} onClear={handleClearFilters} />
        <button type="button" className="secondary-action" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCcw size={16} aria-hidden="true" />
          Atualizar
        </button>
      </section>

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
      {error && (
        <div className="vendas-error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="vendas-loading">Carregando vendas...</div>
      ) : vendas.length === 0 ? (
        <section className="vendas-empty">
          <h2>Nenhuma venda cadastrada.</h2>
          <p>Registre uma nova venda ou ajuste o periodo pesquisado.</p>
        </section>
      ) : (
        <>
          <section className="vendas-grid" aria-label="Resumo visual das vendas">
            {vendas.slice(0, 3).map((venda) => (
              <VendaCard key={venda.id} venda={venda} />
            ))}
          </section>
          <VendaTable vendas={vendas} />
        </>
      )}
    </div>
  )
}

type VendaMetricProps = {
  label: string
  value: string
}

function VendaMetric({ label, value }: VendaMetricProps) {
  return (
    <article className="venda-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
