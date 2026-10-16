import { MapPin, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { getPastos } from '../../pastos/services/pastosService'
import { type Pasto } from '../../pastos/types/pastos.types'
import { formatarAreaEmAlqueiresPaulistas } from '../../../utils/area'
import { type Animal } from '../types/animal.types'
import { FieldLabel } from '../../../components/FieldRequirementBadge'

type ChangePastureModalProps = {
  animal: Animal
  isSaving: boolean
  onClose: () => void
  onConfirm: (pastoId: number) => Promise<void>
}

export function ChangePastureModal({ animal, isSaving, onClose, onConfirm }: ChangePastureModalProps) {
  const [pastos, setPastos] = useState<Pasto[]>([])
  const [selectedPastoId, setSelectedPastoId] = useState<number>(animal.pasto?.id ?? 0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPastos() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getPastos()
        setPastos(data)
      } catch {
        setError('Nao foi possivel carregar os pastos.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPastos()
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const pastosAtivos = useMemo(() => pastos.filter((pasto) => pasto.ativo), [pastos])
  const hasChanged = selectedPastoId > 0 && selectedPastoId !== animal.pasto?.id

  async function handleConfirm() {
    if (!hasChanged) {
      return
    }

    await onConfirm(selectedPastoId)
  }

  const modal = (
    <div className="conta-pagar-modal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="change-pasture-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-pasture-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="change-pasture-header">
          <div>
            <span>Movimentacao de pasto</span>
            <h2 id="change-pasture-title">Alterar Pasto</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar modal">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="change-pasture-current">
          <MapPin size={20} aria-hidden="true" />
          <div>
            <span>Pasto atual</span>
            <strong>{animal.pasto?.nome ?? 'Sem pasto vinculado'}</strong>
          </div>
        </div>

        {error && (
          <div className="animais-error" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="change-pasture-loading">Carregando pastos...</div>
        ) : pastosAtivos.length === 0 ? (
          <p className="change-pasture-empty">Nenhum pasto ativo disponivel.</p>
        ) : (
          <div className="change-pasture-list" role="radiogroup" aria-label="Pastos disponiveis">
            <FieldLabel requirement="required">Novo pasto</FieldLabel>
            {pastosAtivos.map((pasto) => {
              const isCurrent = pasto.id === animal.pasto?.id
              const isSelected = pasto.id === selectedPastoId

              return (
                <label
                  key={pasto.id}
                  className={`change-pasture-option ${isCurrent ? 'is-current' : ''} ${
                    isSelected ? 'is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="pastoId"
                    value={pasto.id}
                    checked={isSelected}
                    disabled={isCurrent || isSaving}
                    onChange={() => setSelectedPastoId(pasto.id)}
                  />
                  <span>
                    <strong>{pasto.nome}</strong>
                    <small>{isCurrent ? 'Pasto atual' : formatarAreaEmAlqueiresPaulistas(pasto.areaHectares)}</small>
                  </span>
                </label>
              )
            })}
          </div>
        )}

        <div className="change-pasture-actions">
          <button type="button" className="secondary-action" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button
            type="button"
            className="primary-action"
            onClick={handleConfirm}
            disabled={!hasChanged || isSaving || isLoading}
          >
            {isSaving ? 'Alterando...' : 'Confirmar Alteracao'}
          </button>
        </div>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
}
