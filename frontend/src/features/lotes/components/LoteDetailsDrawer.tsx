import { Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
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

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const modal = (
    <div className="animal-drawer-overlay" role="presentation" onMouseDown={onClose}>
      <section
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
          <span className={`lote-status ${getStatusClass(lote.status)}`}>{formatStatus(lote.status)}</span>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar detalhes">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <section className="lote-drawer-summary">
          <div>
            <span>Quantidade de animais</span>
            <strong>{numberFormatter.format(lote.quantidadeAnimais)}</strong>
          </div>
          <div>
            <span>Peso total</span>
            <strong>{numberFormatter.format(lote.pesoTotalKg)} kg</strong>
          </div>
          <div>
            <span>Data de criacao</span>
            <strong>{lote.criadoEm ? dateFormatter.format(new Date(lote.criadoEm)) : '-'}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{formatStatus(lote.status)}</strong>
          </div>
        </section>

        <section className="lote-drawer-info">
          <InfoItem label="Nome" value={lote.nome} />
          <InfoItem label="Descricao" value={lote.descricao || 'Sem descricao'} />
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
            <div className="table-wrapper">
              <table className="lote-animals-table">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Raca</th>
                    <th>Sexo</th>
                    <th>Peso</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {lote.animais.map((animal) => (
                    <tr key={animal.id}>
                      <td>
                        <strong>{animal.codigoAnimal}</strong>
                      </td>
                      <td>{animal.raca}</td>
                      <td>{formatSexo(animal.sexo)}</td>
                      <td>{numberFormatter.format(animal.pesoKg)} kg</td>
                      <td>{formatAnimalStatus(animal.status)}</td>
                      <td>
                        <button
                          type="button"
                          className="danger-action"
                          onClick={() => onRemoveAnimal(animal)}
                          disabled={!canChange}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
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

function getStatusClass(status: Lote['status']) {
  const classes: Record<Lote['status'], string> = {
    ABERTO: 'is-aberto',
    VENDIDO: 'is-vendido',
    CANCELADO: 'is-cancelado',
  }

  return classes[status]
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
