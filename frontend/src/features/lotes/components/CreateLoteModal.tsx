import { PackagePlus, X } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { type Animal } from '../../animais/types/animal.types'
import { type CreateLoteRequest } from '../types/lote.types'

type CreateLoteModalProps = {
  animais: Animal[]
  isSaving: boolean
  onClose: () => void
  onConfirm: (data: CreateLoteRequest) => Promise<void>
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function CreateLoteModal({ animais, isSaving, onClose, onConfirm }: CreateLoteModalProps) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [error, setError] = useState<string | null>(null)

  const totalWeight = useMemo(
    () => animais.reduce((sum, animal) => sum + Number(animal.pesoKg || 0), 0),
    [animais],
  )
  const previewAnimals = animais.slice(0, 3)
  const remainingAnimals = Math.max(animais.length - previewAnimals.length, 0)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!nome.trim()) {
      setError('Informe o nome do lote.')
      return
    }

    setError(null)
    await onConfirm({
      nome,
      descricao,
    })
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="create-lote-modal" role="dialog" aria-modal="true" aria-labelledby="create-lote-title">
        <div className="create-lote-header">
          <div>
            <span>Formacao de lote</span>
            <h2 id="create-lote-title">Criar lote</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar modal" disabled={isSaving}>
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <form className="create-lote-form" onSubmit={handleSubmit}>
          <label>
            Nome do lote
            <input
              value={nome}
              maxLength={120}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Lote Nelore Agosto"
              disabled={isSaving}
              autoFocus
            />
            {error && <small>{error}</small>}
          </label>

          <label>
            Descricao
            <textarea
              value={descricao}
              maxLength={500}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Animais separados para venda"
              disabled={isSaving}
              rows={4}
            />
          </label>

          <section className="create-lote-summary" aria-label="Resumo do lote">
            <div>
              <span>Animais selecionados</span>
              <strong>{animais.length}</strong>
            </div>
            <div>
              <span>Peso total</span>
              <strong>{numberFormatter.format(totalWeight)} kg</strong>
            </div>
          </section>

          <section className="create-lote-preview" aria-label="Animais incluidos">
            <span>Lista resumida</span>
            <ul>
              {previewAnimals.map((animal) => (
                <li key={animal.id}>Animal {animal.codigoAnimal}</li>
              ))}
              {remainingAnimals > 0 && <li>+ {remainingAnimals} animais</li>}
            </ul>
          </section>

          <div className="create-lote-actions">
            <button type="button" className="secondary-action" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="primary-action" disabled={isSaving || animais.length === 0}>
              <PackagePlus size={16} aria-hidden="true" />
              {isSaving ? 'Criando...' : 'Criar lote'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
