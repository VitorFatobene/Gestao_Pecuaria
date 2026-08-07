import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationPopup } from '../../../components/NotificationPopup'
import { VendaForm } from '../components/VendaForm'
import { criarVenda } from '../services/vendaService'
import { type VendaRequest } from '../types/venda.types'

export function NovaVenda() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit(data: VendaRequest) {
    try {
      setIsSaving(true)
      setError(null)
      await criarVenda(data)
      setFeedback('Venda registrada com sucesso.')
      window.setTimeout(() => navigate('/vendas'), 1200)
    } catch {
      setError('Nao foi possivel registrar a venda. Revise os dados e tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="venda-editor-page">
      <section className="vendas-page-header">
        <div>
          <span>Nova saida</span>
          <h1>Registrar Venda</h1>
          <p>Selecione um animal ativo e informe os dados comerciais da venda.</p>
        </div>
        <button type="button" className="secondary-action" onClick={() => navigate('/vendas')}>
          <ArrowLeft size={17} aria-hidden="true" />
          Voltar
        </button>
      </section>

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
      {error && (
        <div className="vendas-error" role="alert">
          {error}
        </div>
      )}

      <VendaForm isSaving={isSaving} onSubmit={handleSubmit} onCancel={() => navigate('/vendas')} />
    </div>
  )
}
