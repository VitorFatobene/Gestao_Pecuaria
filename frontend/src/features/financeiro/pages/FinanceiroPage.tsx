import { Beef, Plus, RefreshCcw, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationPopup } from '../../../components/NotificationPopup'
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
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadResumoFinanceiro()
  }, [])

  async function loadResumoFinanceiro(showSuccessPopup = false) {
    try {
      setIsLoading(true)
      setError(null)
      const data = await financeiroService.buscarResumoFinanceiro()
      setResumo(data)
      if (showSuccessPopup) {
        setFeedback('Dados atualizados com sucesso.')
      }
    } catch {
      setError('Não foi possível carregar o resumo financeiro.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="financeiro-page">
      <section className="financeiro-page-header">
        <div>
          <span>Consolidado</span>
          <h1>Visão financeira</h1>
          <p>Acompanhe gastos, receitas, lucro e indicadores da operação com valores em BRL.</p>
        </div>
        <div className="financeiro-header-actions">
          <button type="button" className="secondary-action" onClick={() => navigate('/animais')}>
            <Beef size={17} aria-hidden="true" />
            Ver animais
          </button>
          <button type="button" className="secondary-action" onClick={() => navigate('/vendas')}>
            <ShoppingCart size={17} aria-hidden="true" />
            Ver vendas
          </button>
          <button type="button" className="primary-action" onClick={() => navigate('/vendas/nova')}>
            <Plus size={17} aria-hidden="true" />
            Registrar venda
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={() => loadResumoFinanceiro(true)}
            disabled={isLoading}
          >
            <RefreshCcw size={16} aria-hidden="true" />
            Atualizar resumo
          </button>
        </div>
      </section>

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
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
        </>
      ) : (
        <section className="financeiro-empty">
          <h2>Resumo financeiro indisponível.</h2>
          <p>Tente atualizar a página ou verifique a conexão com a API.</p>
        </section>
      )}
    </div>
  )
}
