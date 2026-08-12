import { ArrowLeft, ReceiptText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarVendaPorId } from '../services/vendaService'
import { type Venda } from '../types/venda.types'
import { formatPaymentInstallment, formatPaymentType } from '../utils/paymentFormatters'

const numberFormatter = new Intl.NumberFormat('pt-BR')
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}

function formatDateTime(date?: string) {
  if (!date) {
    return '-'
  }

  return dateTimeFormatter.format(new Date(date))
}

export function DetalhesVenda() {
  const { id } = useParams()
  const navigate = useNavigate()
  const vendaId = id ? Number(id) : null
  const [venda, setVenda] = useState<Venda | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVenda() {
      if (!vendaId) {
        setError('Venda invalida.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const data = await buscarVendaPorId(vendaId)
        setVenda(data)
      } catch {
        setError('Nao foi possivel carregar os detalhes da venda.')
      } finally {
        setIsLoading(false)
      }
    }

    loadVenda()
  }, [vendaId])

  if (isLoading) {
    return <div className="vendas-loading">Carregando venda...</div>
  }

  if (error || !venda) {
    return (
      <div className="venda-details-page">
        <div className="vendas-error" role="alert">
          {error ?? 'Venda nao encontrada.'}
        </div>
        <button type="button" className="secondary-action" onClick={() => navigate('/vendas')}>
          <ArrowLeft size={17} aria-hidden="true" />
          Voltar para Vendas
        </button>
      </div>
    )
  }

  return (
    <div className="venda-details-page">
      <section className="venda-details-hero">
        <div className="venda-details-icon">
          <ReceiptText size={34} aria-hidden="true" />
        </div>
        <div>
          <span>Venda realizada</span>
          <h1>Venda #{venda.id}</h1>
          <p>
            Animal {venda.codigoAnimal} vendido para {venda.nomeComprador}
          </p>
        </div>
        <button type="button" className="secondary-action" onClick={() => navigate('/vendas')}>
          <ArrowLeft size={17} aria-hidden="true" />
          Voltar para Vendas
        </button>
      </section>

      <section className="venda-details-grid">
        <DetailItem label="ID da Venda" value={`#${venda.id}`} />
        <DetailItem label="Codigo do Animal" value={String(venda.codigoAnimal)} />
        <DetailItem label="Comprador" value={venda.nomeComprador} />
        <DetailItem label="Valor" value={currencyFormatter.format(venda.valorVenda)} />
        <DetailItem label="Tipo" value={formatPaymentType(venda.pagamento)} />
        <DetailItem label="Parcela" value={formatPaymentInstallment(venda.pagamento)} />
        <DetailItem label="Data" value={formatDate(venda.dataVenda)} />
        <DetailItem label="Peso em kg" value={`${numberFormatter.format(venda.pesoKgVenda)} kg`} />
        <DetailItem label="Peso em arroba" value={`${numberFormatter.format(venda.pesoArrobaVenda)} @`} />
        <DetailItem label="Data do Registro" value={formatDateTime(venda.criadoEm)} />
      </section>
    </div>
  )
}

type DetailItemProps = {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <article className="venda-detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
