import { Beef, Plus, RefreshCcw, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimalStatusSummary } from '../components/AnimalStatusSummary'
import { FinancialChart } from '../components/FinancialChart'
import { FinancialIndicators } from '../components/FinancialIndicators'
import { FinancialSummaryCards } from '../components/FinancialSummaryCards'
import { financeiroService } from '../services/financeiroService'
import { type FinanceiroResumo } from '../types/financeiro.types'

export function FinanceiroPage() {
  const navigate = useNavigate()
  const [resumo, setResumo] = useState<FinanceiroResumo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadResumoFinanceiro()
  }, [])

  async function loadResumoFinanceiro() {
    try {
      setIsLoading(true)
      setError(null)
      const data = await financeiroService.buscarResumoFinanceiro()
      setResumo(data)
    } catch {
      setError('Nao foi possivel carregar o resumo financeiro.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="financeiro-page">
      <section className="financeiro-page-header">
        <div>
          <span>Consolidado</span>
          <h1>Visao Financeira</h1>
          <p>Acompanhe gastos, receitas, lucro e indicadores operacionais calculados a partir da API.</p>
        </div>
        <div className="financeiro-header-actions">
          <button type="button" className="secondary-action" onClick={() => navigate('/animais')}>
            <Beef size={17} aria-hidden="true" />
            Ver Animais
          </button>
          <button type="button" className="secondary-action" onClick={() => navigate('/vendas')}>
            <ShoppingCart size={17} aria-hidden="true" />
            Ver Vendas
          </button>
          <button type="button" className="primary-action" onClick={() => navigate('/vendas/nova')}>
            <Plus size={17} aria-hidden="true" />
            Registrar Venda
          </button>
        </div>
      </section>

      {error && (
        <div className="financeiro-error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="financeiro-loading">Carregando resumo financeiro...</div>
      ) : resumo ? (
        <>
          <FinancialSummaryCards resumo={resumo} />
          <section className="financeiro-content-grid">
            <FinancialChart resumo={resumo} />
            <FinancialIndicators resumo={resumo} />
          </section>
          <AnimalStatusSummary resumo={resumo} />
          <div className="financeiro-refresh-row">
            <button type="button" className="secondary-action" onClick={loadResumoFinanceiro}>
              <RefreshCcw size={16} aria-hidden="true" />
              Atualizar Resumo
            </button>
          </div>
        </>
      ) : (
        <section className="financeiro-empty">
          <h2>Resumo financeiro indisponivel.</h2>
          <p>Tente atualizar a pagina ou verifique a conexao com a API.</p>
        </section>
      )}
    </div>
  )
}
