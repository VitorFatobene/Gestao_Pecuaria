import { X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { type Pasto, type PastoRequestDTO } from '../types/pastos.types'

type PastoModalFormProps = {
  pasto: Pasto | null
  isSaving: boolean
  onClose: () => void
  onSubmit: (data: PastoRequestDTO) => Promise<void>
}

type FormErrors = {
  nome?: string
  areaHectares?: string
}

export function PastoModalForm({ pasto, isSaving, onClose, onSubmit }: PastoModalFormProps) {
  const [nome, setNome] = useState(pasto?.nome ?? '')
  const [areaHectares, setAreaHectares] = useState(pasto ? String(pasto.areaHectares) : '')
  const [descricao, setDescricao] = useState(pasto?.descricao ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const isEditing = Boolean(pasto)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedArea = Number(areaHectares)
    const nextErrors: FormErrors = {}

    if (!nome.trim()) {
      nextErrors.nome = 'Informe o nome do pasto.'
    }

    if (!Number.isFinite(parsedArea) || parsedArea <= 0) {
      nextErrors.areaHectares = 'Informe uma area maior que zero.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    await onSubmit({
      nome: nome.trim(),
      areaHectares: parsedArea,
      descricao: descricao.trim() || undefined,
    })
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="pasto-modal" role="dialog" aria-modal="true" aria-labelledby="pasto-modal-title">
        <div className="pasto-modal-header">
          <div>
            <span>{isEditing ? 'Editar cadastro' : 'Novo cadastro'}</span>
            <h2 id="pasto-modal-title">{isEditing ? 'Editar pasto' : 'Novo pasto'}</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar modal">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <form className="pasto-form" onSubmit={handleSubmit}>
          <label>
            Nome do pasto
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Pasto Piquete 01"
              autoFocus
            />
            {errors.nome && <small>{errors.nome}</small>}
          </label>

          <label>
            Area em hectares
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={areaHectares}
              onChange={(event) => setAreaHectares(event.target.value)}
              placeholder="18.50"
            />
            {errors.areaHectares && <small>{errors.areaHectares}</small>}
          </label>

          <label>
            Descricao
            <textarea
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Area com bebedouro central e sombra natural."
              rows={3}
            />
          </label>

          <div className="pasto-form-actions">
            <button type="button" className="secondary-action" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="primary-action" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
