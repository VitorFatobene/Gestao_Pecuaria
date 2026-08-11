import { Trash2, X } from 'lucide-react'
import { type Lote, type LoteAnimal } from '../types/lote.types'

type LoteDetailsDrawerProps = {
  lote: Lote
  onClose: () => void
  onRemoveAnimal: (animal: LoteAnimal) => void
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function LoteDetailsDrawer({ lote, onClose, onRemoveAnimal }: LoteDetailsDrawerProps) {
  const canChange = lote.status === 'ABERTO'

  return (
    <div className="lote-drawer-overlay" role="presentation" onMouseDown={onClose}>
      <aside
        className="lote-details-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lote-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="lote-drawer-header">
          <div>
            <span>Detalhes do lote</span>
            <h2 id="lote-drawer-title">{lote.nome}</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar detalhes">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <section className="lote-drawer-info">
          <InfoItem label="Nome" value={lote.nome} />
          <InfoItem label="Descricao" value={lote.descricao || 'Sem descricao'} />
          <InfoItem label="Status" value={formatStatus(lote.status)} />
          <InfoItem label="Criado em" value={lote.criadoEm ? dateFormatter.format(new Date(lote.criadoEm)) : '-'} />
        </section>

        <section className="lote-drawer-summary">
          <div>
            <span>Quantidade de animais</span>
            <strong>{numberFormatter.format(lote.quantidadeAnimais)}</strong>
          </div>
          <div>
            <span>Peso total</span>
            <strong>{numberFormatter.format(lote.pesoTotalKg)} kg</strong>
          </div>
        </section>

        {!canChange && <div className="lote-change-warning">Este lote nao permite alteracoes.</div>}

        <section className="lote-animals-section">
          <div className="lote-section-title">
            <span>Animais do lote</span>
            <strong>{lote.animais.length}</strong>
          </div>

          {lote.animais.length === 0 ? (
            <div className="lote-animals-empty">Nenhum animal associado a este lote.</div>
          ) : (
            <div className="lote-animals-list">
              {lote.animais.map((animal) => (
                <article className="lote-animal-row" key={animal.id}>
                  <div>
                    <span>Codigo</span>
                    <strong>{animal.codigoAnimal}</strong>
                  </div>
                  <div>
                    <span>Nome</span>
                    <strong>Nao cadastrado</strong>
                  </div>
                  <div>
                    <span>Raca</span>
                    <strong>{animal.raca}</strong>
                  </div>
                  <div>
                    <span>Peso</span>
                    <strong>{numberFormatter.format(animal.pesoKg)} kg</strong>
                  </div>
                  <div>
                    <span>Sexo</span>
                    <strong>{formatSexo(animal.sexo)}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{formatAnimalStatus(animal.status)}</strong>
                  </div>
                  <button
                    type="button"
                    className="danger-action"
                    onClick={() => onRemoveAnimal(animal)}
                    disabled={!canChange}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Remover do lote
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </aside>
    </div>
  )
}

type InfoItemProps = {
  label: string
  value: string
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function formatStatus(status: Lote['status']) {
  const labels: Record<Lote['status'], string> = {
    ABERTO: 'Aberto',
    VENDIDO: 'Vendido',
    CANCELADO: 'Cancelado',
  }

  return labels[status]
}

function formatAnimalStatus(status: LoteAnimal['status']) {
  const labels: Record<LoteAnimal['status'], string> = {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
    VENDIDO: 'Vendido',
  }

  return labels[status]
}

function formatSexo(sexo: LoteAnimal['sexo']) {
  if (sexo === 'MACHO') {
    return 'Macho'
  }

  if (sexo === 'FEMEA') {
    return 'Femea'
  }

  return 'Nao informado'
}
