import { AxiosError } from 'axios'
import { Save, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationPopup } from '../../../components/NotificationPopup'
import { type Lote } from '../../lotes/types/lote.types'
import { LoteSelector } from '../components/lote/LoteSelector'
import { PaymentConditionForm } from '../components/lote/PaymentConditionForm'
import { PaymentPreview } from '../components/lote/PaymentPreview'
import { SelectedLoteSummary } from '../components/lote/SelectedLoteSummary'
import { VendaLoteForm } from '../components/lote/VendaLoteForm'
import { SalesHero } from '../components/SalesHero'
import { venderLote } from '../services/vendaService'
import { type CondicaoPagamento, type VendaLoteRequest } from '../types/venda.types'
import { buildPaymentPreview } from '../utils/paymentPreview'

type VendaLoteFormState = {
  comprador: string
  valorTotal: number
  dataVenda: string
}

type FormErrors = Partial<Record<'loteId' | 'comprador' | 'valorTotal' | 'dataVenda' | 'diasCarencia' | 'entrada' | 'quantidadeParcelas' | 'intervaloDias', string>>

const today = new Date().toISOString().slice(0, 10)

const initialSaleData: VendaLoteFormState = {
  comprador: '',
  valorTotal: 0,
  dataVenda: today,
}

const initialCondition: CondicaoPagamento = {
  tipoPagamento: 'A_VISTA',
  entrada: null,
  quantidadeParcelas: null,
  intervaloDias: null,
  diasCarencia: null,
}

export function NovaVendaLote() {
  const navigate = useNavigate()
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null)
  const [saleData, setSaleData] = useState<VendaLoteFormState>(initialSaleData)
  const [condition, setCondition] = useState<CondicaoPagamento>(initialCondition)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const previewItems = useMemo(
    () => buildPaymentPreview(saleData.valorTotal, saleData.dataVenda, condition),
    [condition, saleData.dataVenda, saleData.valorTotal],
  )

  function validate() {
    const nextErrors: FormErrors = {}

    if (!selectedLote) {
      nextErrors.loteId = 'Selecione um lote aberto.'
    }

    if (!saleData.comprador.trim()) {
      nextErrors.comprador = 'Informe o comprador.'
    }

    if (saleData.valorTotal <= 0) {
      nextErrors.valorTotal = 'Informe um valor maior que zero.'
    }

    if (!saleData.dataVenda) {
      nextErrors.dataVenda = 'Informe a data da venda.'
    }

    if (condition.tipoPagamento === 'PRAZO' && (!condition.diasCarencia || condition.diasCarencia <= 0)) {
      nextErrors.diasCarencia = 'Informe uma carencia maior que zero.'
    }

    if (condition.tipoPagamento === 'PARCELADO') {
      const entrada = condition.entrada ?? 0

      if (entrada < 0) {
        nextErrors.entrada = 'A entrada nao pode ser negativa.'
      }

      if (entrada > saleData.valorTotal) {
        nextErrors.entrada = 'A entrada nao pode ser maior que o valor total.'
      }

      if (!condition.quantidadeParcelas || condition.quantidadeParcelas <= 0) {
        nextErrors.quantidadeParcelas = 'Informe uma quantidade maior que zero.'
      }

      if (!condition.intervaloDias || condition.intervaloDias <= 0) {
        nextErrors.intervaloDias = 'Informe um intervalo maior que zero.'
      }
    }

    return nextErrors
  }

  async function handleSubmit() {
    const nextErrors = validate()
    setErrors(nextErrors)
    setError(null)

    if (Object.keys(nextErrors).length > 0 || !selectedLote) {
      return
    }

    const payload: VendaLoteRequest = {
      loteId: selectedLote.id,
      comprador: saleData.comprador.trim(),
      valorTotal: saleData.valorTotal,
      dataVenda: saleData.dataVenda,
      condicaoPagamento: normalizeCondition(condition),
    }

    try {
      setIsSaving(true)
      await venderLote(payload)
      setFeedback('Venda do lote registrada com sucesso.')
      window.setTimeout(() => navigate('/vendas'), 900)
    } catch (err) {
      setError(getFriendlyErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="venda-lote-page">
      <SalesHero variant="lote" onBack={() => navigate('/vendas')} />

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
      {error && (
        <div className="sales-error" role="alert">
          {error}
        </div>
      )}

      <section className="venda-lote-grid">
        <div className="venda-lote-main">
          <LoteSelector selectedLoteId={selectedLote?.id ?? null} error={errors.loteId} onSelect={setSelectedLote} />
          <VendaLoteForm data={saleData} errors={errors} isSaving={isSaving} onChange={setSaleData} />
          <PaymentConditionForm
            condition={condition}
            errors={errors}
            isSaving={isSaving}
            valorTotal={saleData.valorTotal}
            onChange={setCondition}
          />
        </div>

        <aside className="venda-lote-side" aria-label="Resumo da venda">
          <SelectedLoteSummary lote={selectedLote} />
          <PaymentPreview items={previewItems} />
        </aside>
      </section>

      <div className="venda-lote-actions">
        <button type="button" className="secondary-action" onClick={() => navigate('/vendas')} disabled={isSaving}>
          <X size={16} aria-hidden="true" />
          Cancelar
        </button>
        <button type="button" className="primary-action" onClick={handleSubmit} disabled={isSaving}>
          <Save size={16} aria-hidden="true" />
          {isSaving ? 'Registrando...' : 'Registrar venda do lote'}
        </button>
      </div>
    </div>
  )
}

function normalizeCondition(condition: CondicaoPagamento): CondicaoPagamento {
  if (condition.tipoPagamento === 'A_VISTA') {
    return { tipoPagamento: 'A_VISTA' }
  }

  if (condition.tipoPagamento === 'PRAZO') {
    return {
      tipoPagamento: 'PRAZO',
      diasCarencia: condition.diasCarencia ?? null,
    }
  }

  return {
    tipoPagamento: 'PARCELADO',
    entrada: condition.entrada ?? 0,
    quantidadeParcelas: condition.quantidadeParcelas ?? null,
    intervaloDias: condition.intervaloDias ?? null,
    diasCarencia: condition.diasCarencia ?? null,
  }
}

function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return 'Nao foi possivel registrar a venda do lote.'
}
