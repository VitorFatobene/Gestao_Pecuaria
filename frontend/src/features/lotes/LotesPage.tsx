import { PackagePlus, RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationPopup } from '../../components/NotificationPopup'
import { CreateLoteModal } from './components/CreateLoteModal'
import { ConfirmModal } from './components/ConfirmModal'
import { LoteCard } from './components/LoteCard'
import { LoteDetailsDrawer } from './components/LoteDetailsDrawer'
import {
  atualizarLote,
  buscarLotePorId,
  buscarLotes,
  cancelarLote,
  removerAnimalDoLote,
} from './services/loteService'
import { type CreateLoteRequest, type Lote, type LoteAnimal } from './types/lote.types'

type PendingConfirmation =
  | { type: 'remove-animal'; lote: Lote; animal: LoteAnimal }
  | { type: 'cancel-lote'; lote: Lote }

export function LotesPage() {
  const navigate = useNavigate()
  const [lotes, setLotes] = useState<Lote[]>([])
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null)
  const [loteToEdit, setLoteToEdit] = useState<Lote | null>(null)
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const loadLotes = useCallback(async (showSuccessPopup = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await buscarLotes()
      setLotes(data)
      setSelectedLote((current) => (current ? data.find((lote) => lote.id === current.id) ?? null : null))

      if (showSuccessPopup) {
        setFeedback('Dados atualizados com sucesso.')
      }
    } catch {
      setError('Nao foi possivel carregar os lotes.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLotes()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadLotes])

  async function handleView(lote: Lote) {
    try {
      setError(null)
      const data = await buscarLotePorId(lote.id)
      setSelectedLote(data)
      updateLoteState(data)
    } catch {
      setError('Nao foi possivel carregar os detalhes do lote.')
    }
  }

  async function handleEdit(data: CreateLoteRequest) {
    if (!loteToEdit) {
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      const updatedLote = await atualizarLote(loteToEdit.id, data)
      updateLoteState(updatedLote)
      setLoteToEdit(null)
      setFeedback('Lote atualizado com sucesso.')
    } catch {
      setError('Nao foi possivel atualizar o lote.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleConfirmAction() {
    if (!pendingConfirmation) {
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      if (pendingConfirmation.type === 'remove-animal') {
        const updatedLote = await removerAnimalDoLote(pendingConfirmation.lote.id, pendingConfirmation.animal.id)
        updateLoteState(updatedLote)
        setFeedback('Animal removido do lote.')
      } else {
        const updatedLote = await cancelarLote(pendingConfirmation.lote.id)
        updateLoteState(updatedLote)
        setFeedback('Lote cancelado com sucesso.')
      }

      setPendingConfirmation(null)
    } catch {
      setError(
        pendingConfirmation.type === 'remove-animal'
          ? 'Nao foi possivel remover o animal do lote.'
          : 'Nao foi possivel cancelar o lote.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  function updateLoteState(updatedLote: Lote) {
    setLotes((current) => current.map((lote) => (lote.id === updatedLote.id ? updatedLote : lote)))
    setSelectedLote((current) => (current?.id === updatedLote.id ? updatedLote : current))
  }

  const confirmationContent = getConfirmationContent(pendingConfirmation)

  return (
    <div className="lotes-page">
      <section className="lotes-page-header">
        <div>
          <span>Lotes</span>
          <h1>Gerenciamento de lotes</h1>
          <p>Administre lotes criados antes da venda, revise animais associados e cancele lotes em aberto.</p>
        </div>
        <div className="lotes-header-actions">
          <button type="button" className="secondary-action" onClick={() => loadLotes(true)} disabled={isLoading}>
            <RefreshCcw size={16} aria-hidden="true" />
            Atualizar
          </button>
          <button type="button" className="primary-action" onClick={() => navigate('/animais')}>
            <PackagePlus size={16} aria-hidden="true" />
            Criar lote
          </button>
        </div>
      </section>

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
      {error && (
        <div className="lotes-error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <section className="lotes-grid" aria-label="Carregando lotes">
          {Array.from({ length: 4 }).map((_, index) => (
            <article className="lote-card lote-card-skeleton" key={index}>
              <i className="skeleton-line skeleton-title" />
              <i className="skeleton-line skeleton-row" />
              <i className="skeleton-line skeleton-row" />
            </article>
          ))}
        </section>
      ) : lotes.length === 0 ? (
        <section className="lotes-empty">
          <h2>Nenhum lote criado.</h2>
          <p>Crie seu primeiro lote selecionando animais do rebanho.</p>
          <button type="button" className="primary-action" onClick={() => navigate('/animais')}>
            <PackagePlus size={16} aria-hidden="true" />
            Selecionar animais
          </button>
        </section>
      ) : (
        <section className="lotes-grid" aria-label="Lista de lotes">
          {lotes.map((lote) => (
            <LoteCard
              key={lote.id}
              lote={lote}
              onView={handleView}
              onEdit={setLoteToEdit}
              onCancel={(item) => setPendingConfirmation({ type: 'cancel-lote', lote: item })}
            />
          ))}
        </section>
      )}

      {selectedLote && (
        <LoteDetailsDrawer
          lote={selectedLote}
          onClose={() => setSelectedLote(null)}
          onRemoveAnimal={(animal) => {
            if (selectedLote.status !== 'ABERTO') {
              setFeedback('Este lote nao permite alteracoes.')
              return
            }

            setPendingConfirmation({ type: 'remove-animal', lote: selectedLote, animal })
          }}
        />
      )}

      {loteToEdit && (
        <CreateLoteModal
          animais={[]}
          isSaving={isSaving}
          initialValues={{ nome: loteToEdit.nome, descricao: loteToEdit.descricao }}
          title="Editar lote"
          eyebrow="Dados do lote"
          submitLabel="Salvar lote"
          savingLabel="Salvando..."
          showAnimalSummary={false}
          onClose={() => setLoteToEdit(null)}
          onConfirm={handleEdit}
        />
      )}

      {pendingConfirmation && confirmationContent && (
        <ConfirmModal
          title={confirmationContent.title}
          message={confirmationContent.message}
          confirmLabel={confirmationContent.confirmLabel}
          tone={confirmationContent.tone}
          isLoading={isSaving}
          onCancel={() => setPendingConfirmation(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  )
}

function getConfirmationContent(pendingConfirmation: PendingConfirmation | null) {
  if (!pendingConfirmation) {
    return null
  }

  if (pendingConfirmation.type === 'remove-animal') {
    return {
      title: 'Remover animal',
      message: 'Tem certeza que deseja remover este animal do lote?',
      confirmLabel: 'Remover do lote',
      tone: 'danger' as const,
    }
  }

  return {
    title: 'Cancelar lote',
    message: `Tem certeza que deseja cancelar o lote ${pendingConfirmation.lote.nome}?`,
    confirmLabel: 'Cancelar lote',
    tone: 'danger' as const,
  }
}
