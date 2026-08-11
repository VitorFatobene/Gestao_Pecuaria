import { ClipboardList } from 'lucide-react'
import { type Lote } from '../../../lotes/types/lote.types'

type SelectedLoteSummaryProps = {
  lote: Lote | null
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function SelectedLoteSummary({ lote }: SelectedLoteSummaryProps) {
  if (!lote) {
    return (
      <section className="venda-lote-card">
        <div className="venda-lote-section-title">
          <ClipboardList size={18} aria-hidden="true" />
          <div>
            <span>Resumo do lote</span>
            <h2>Nenhum lote selecionado</h2>
          </div>
        </div>
        <div className="venda-lote-empty">Selecione um lote aberto para conferir animais, peso e status.</div>
      </section>
    )
  }

  return (
    <section className="venda-lote-card">
      <div className="venda-lote-section-title">
        <ClipboardList size={18} aria-hidden="true" />
        <div>
          <span>Resumo do lote</span>
          <h2>{lote.nome}</h2>
        </div>
      </div>

      <dl className="venda-lote-summary-grid">
        <div>
          <dt>Status</dt>
          <dd>{lote.status}</dd>
        </div>
        <div>
          <dt>Animais</dt>
          <dd>{lote.quantidadeAnimais}</dd>
        </div>
        <div>
          <dt>Peso total</dt>
          <dd>{numberFormatter.format(lote.pesoTotalKg)} kg</dd>
        </div>
        <div>
          <dt>Valor investido</dt>
          <dd>Nao informado</dd>
        </div>
      </dl>

      <div className="venda-lote-animals">
        <strong>Animais</strong>
        {lote.animais.length === 0 ? (
          <p>Nenhum animal vinculado ao lote.</p>
        ) : (
          <ul>
            {lote.animais.map((animal) => (
              <li key={animal.id}>
                <span>{animal.codigoAnimal}</span>
                <strong>{animal.raca}</strong>
                <small>
                  {numberFormatter.format(animal.pesoKg)} kg - {animal.status}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
