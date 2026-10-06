import { Plus, X } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { alqueiresPaulistasParaHectares, hectaresParaAlqueiresPaulistas } from '../../../utils/area'
import { type Pasto, type PastoRequestDTO } from '../types/pastos.types'

type PastoModalFormProps = {
  pasto: Pasto | null
  isSaving: boolean
  onClose: () => void
  onSubmit: (data: PastoRequestDTO) => Promise<void>
}

type FormErrors = {
  nome?: string
  areaAlqueires?: string
}

export function PastoModalForm({ pasto, isSaving, onClose, onSubmit }: PastoModalFormProps) {
  const [nome, setNome] = useState(pasto?.nome ?? '')
  const [areaAlqueires, setAreaAlqueires] = useState(
    pasto ? hectaresParaAlqueiresPaulistas(pasto.areaHectares).toFixed(2) : '',
  )
  const [descricao, setDescricao] = useState(pasto?.descricao ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const isEditing = Boolean(pasto)

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAreaAlqueires = Number(areaAlqueires)
    const nextErrors: FormErrors = {}

    if (!nome.trim()) {
      nextErrors.nome = 'Informe o nome do pasto.'
    }

    if (!Number.isFinite(parsedAreaAlqueires) || parsedAreaAlqueires <= 0) {
      nextErrors.areaAlqueires = 'Informe uma area maior que zero.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    await onSubmit({
      nome: nome.trim(),
      areaHectares: alqueiresPaulistasParaHectares(parsedAreaAlqueires),
      descricao: descricao.trim() || undefined,
    })
  }

  const modal = (
    <div className="conta-pagar-modal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="conta-pagar-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pasto-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="conta-pagar-modal-header">
          <div>
            <span>{isEditing ? 'Editar cadastro' : 'Novo cadastro'}</span>
            <h2 id="pasto-modal-title">{isEditing ? 'Editar pasto' : 'Novo pasto'}</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar modal" disabled={isSaving}>
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <form className="conta-pagar-form" onSubmit={handleSubmit}>
          <label className="form-field-wide">
            <span>Nome do pasto</span>
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Pasto Piquete 01"
              disabled={isSaving}
              autoFocus
            />
            {errors.nome && <small>{errors.nome}</small>}
          </label>

          <label>
            <span>Area em alqueires</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={areaAlqueires}
              onChange={(event) => setAreaAlqueires(event.target.value)}
              placeholder="7.64"
              disabled={isSaving}
            />
            {errors.areaAlqueires && <small>{errors.areaAlqueires}</small>}
          </label>

          <label className="form-field-wide">
            <span>Descricao</span>
            <textarea
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Area com bebedouro central e sombra natural."
              disabled={isSaving}
              rows={3}
            />
          </label>

          <div className="conta-pagar-form-actions">
            <button type="button" className="secondary-action" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="primary-action" disabled={isSaving}>
              <Plus size={16} aria-hidden="true" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
}
