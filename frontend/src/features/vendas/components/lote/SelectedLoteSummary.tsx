import { ClipboardList } from 'lucide-react'
import { type Lote } from '../../../lotes/types/lote.types'
import { WeightDisplay } from '../../../../components/WeightDisplay'
import { formatarArrobas, formatarPesoKg } from '../../../../utils/peso'

type SelectedLoteSummaryProps = {
  lote: Lote | null
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

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

  const investimento = calcularInvestimento(lote)

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
          <dd><WeightDisplay pesoKg={lote.pesoTotalKg} /></dd>
        </div>
        <div>
          <dt>Valor investido</dt>
          <dd className={!investimento.conhecido ? 'is-unknown' : undefined} title={investimento.aviso}>
            {investimento.conhecido ? currencyFormatter.format(investimento.total) : 'Não informado'}
          </dd>
        </div>
      </dl>

      {!investimento.conhecido && (
        <p className="venda-lote-investment-note">Há animais sem valor de aquisição informado.</p>
      )}

      <div className="venda-lote-animals">
        <strong>Animais do lote</strong>
        {lote.animais.length === 0 ? (
          <p>Nenhum animal vinculado ao lote.</p>
        ) : (
          <ul>
            {lote.animais.map((animal) => (
              <li key={animal.id}>
                <div className="venda-lote-animal-heading">
                  <div>
                    <span>Brinco</span>
                    <b>{animal.codigoAnimal}</b>
                  </div>
                  <small>{formatStatus(animal.status)}</small>
                </div>
                <strong>{animal.raca}</strong>
                <p className="venda-lote-animal-weight">{formatWeight(animal.pesoKg)}</p>
                <div className="venda-lote-animal-cost">
                  <span>Valor de aquisição</span>
                  <b>{formatCost(animal.custoAquisicao)}</b>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function calcularInvestimento(lote: Lote) {
  if (lote.animais.some((animal) => !isCustoConhecido(animal.custoAquisicao))) {
    return {
      conhecido: false,
      total: 0,
      aviso: 'Há animais sem valor de aquisição informado.',
    }
  }

  return {
    conhecido: true,
    total: lote.animais.reduce((total, animal) => total + animal.custoAquisicao!, 0),
    aviso: undefined,
  }
}

function isCustoConhecido(custoAquisicao: unknown): custoAquisicao is number {
  return typeof custoAquisicao === 'number' && Number.isFinite(custoAquisicao) && custoAquisicao > 0
}

function formatCost(custoAquisicao: number | null | undefined) {
  return isCustoConhecido(custoAquisicao) ? currencyFormatter.format(custoAquisicao) : 'Não informado'
}

function formatWeight(pesoKg: number) {
  const peso = formatarPesoKg(pesoKg)
  const arrobas = formatarArrobas(pesoKg)

  if (!peso || !arrobas) {
    return 'Peso não informado'
  }

  return `${peso} • ${arrobas}`
}

function formatStatus(status: Lote['animais'][number]['status']) {
  const labels: Record<Lote['animais'][number]['status'], string> = {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
    VENDIDO: 'Vendido',
  }

  return labels[status]
}
