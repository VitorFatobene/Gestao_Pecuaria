import { ReceiptText } from 'lucide-react'
import { type PaymentPreviewItem } from '../../utils/paymentPreview'

type PaymentPreviewProps = {
  items: PaymentPreviewItem[]
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function PaymentPreview({ items }: PaymentPreviewProps) {
  return (
    <section className="venda-lote-card">
      <div className="venda-lote-section-title">
        <ReceiptText size={18} aria-hidden="true" />
        <div>
          <span>Previa das parcelas</span>
          <h2>Projecao financeira</h2>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="venda-lote-empty">Informe valor, data e condicao de pagamento para gerar a previa.</div>
      ) : (
        <ol className="payment-preview-list">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              <div>
                <strong>{item.label}</strong>
                <span>{formatDate(item.dataVencimento)}</span>
              </div>
              <div>
                <strong>{currencyFormatter.format(item.valor)}</strong>
                <small>{item.status}</small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}
