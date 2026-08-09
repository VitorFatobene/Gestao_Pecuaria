import { RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationPopup } from '../../../components/NotificationPopup'
import { PastoModalForm } from '../components/PastoModalForm'
import { PastureCard } from '../components/PastureCard'
import { PastureDetailsDrawer } from '../components/PastureDetailsDrawer'
import { PastureFilters } from '../components/PastureFilters'
import { PastureHero } from '../components/PastureHero'
import { PastureSummaryCards } from '../components/PastureSummaryCards'
import { PastureTable } from '../components/PastureTable'
import { createPasto, desativarPasto, getPastoDetalhes, getPastosResumo, updatePasto } from '../services/pastosService'
import {
  type PastoDetalhes,
  type PastoFilterParams,
  type PastoRequestDTO,
  type PastoResumo,
  type PastoViewMode,
} from '../types/pastos.types'

export function PastosListPage() {
  const navigate = useNavigate()
  const [pastos, setPastos] = useState<PastoResumo[]>([])
  const [filters, setFilters] = useState<PastoFilterParams>({})
  const [viewMode, setViewMode] = useState<PastoViewMode>('cards')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [updatingPastoId, setUpdatingPastoId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPasto, setSelectedPasto] = useState<PastoResumo | null>(null)
  const [detailsPasto, setDetailsPasto] = useState<PastoResumo | null>(null)
  const [details, setDetails] = useState<PastoDetalhes | null>(null)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  const filteredPastos = useMemo(() => {
    const normalizedSearch = normalizeText(filters.busca)
    const statusFilter = filters.status ?? 'todos'
    const tipoFilter = filters.tipoPastagem ?? 'todos'

    return pastos.filter((pasto) => {
      const matchesSearch = !normalizedSearch || normalizeText(pasto.nome).includes(normalizedSearch)
      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'ativos' && pasto.ativo) ||
        (statusFilter === 'inativos' && !pasto.ativo)
      const matchesTipo = tipoFilter === 'todos' || pasto.tipoPastagem === tipoFilter

      return matchesSearch && matchesStatus && matchesTipo
    })
  }, [pastos, filters])

  const tiposPastagem = useMemo(() => {
    const uniqueTypes = new Set(pastos.map((pasto) => pasto.tipoPastagem).filter(Boolean))
    return Array.from(uniqueTypes).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [pastos])

  const loadPastos = useCallback(async (showSuccessPopup = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getPastosResumo()
      setPastos(data)
      if (showSuccessPopup) {
        setFeedback('Dados atualizados com sucesso.')
      }
    } catch {
      setError('Nao foi possivel carregar os pastos. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPastos()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadPastos])

  function openCreateModal() {
    setSelectedPasto(null)
    setFeedback(null)
    setIsModalOpen(true)
  }

  function openEditModal(pasto: PastoResumo) {
    setSelectedPasto(pasto)
    setFeedback(null)
    setIsModalOpen(true)
  }

  async function openDetailsDrawer(pasto: PastoResumo) {
    try {
      setDetailsPasto(pasto)
      setDetails(null)
      setIsDetailsLoading(true)
      setError(null)
      const data = await getPastoDetalhes(pasto.id)
      setDetails(data)
    } catch {
      setError('Nao foi possivel carregar os detalhes do pasto. Tente novamente mais tarde.')
    } finally {
      setIsDetailsLoading(false)
    }
  }

  async function handleSubmit(data: PastoRequestDTO) {
    try {
      setIsSaving(true)
      setError(null)

      if (selectedPasto) {
        await updatePasto(selectedPasto.id, data)
      } else {
        await createPasto(data)
      }

      await loadPastos()
      setFeedback(selectedPasto ? 'Pasto atualizado com sucesso.' : 'Pasto criado com sucesso.')
      setIsModalOpen(false)
      setSelectedPasto(null)
    } catch {
      setError('Nao foi possivel salvar o pasto. Revise os dados e tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeactivate(pasto: PastoResumo) {
    const confirmed = window.confirm(`Deseja desativar o pasto "${pasto.nome}"?`)

    if (!confirmed) {
      return
    }

    try {
      setUpdatingPastoId(pasto.id)
      setError(null)
      await desativarPasto(pasto.id)
      await loadPastos()
      setDetailsPasto((current) => (current?.id === pasto.id ? { ...current, ativo: false } : current))
      setDetails((current) =>
        current?.pasto.id === pasto.id ? { ...current, pasto: { ...current.pasto, ativo: false } } : current,
      )
      setFeedback('Pasto desativado com sucesso.')
    } catch {
      setError('Nao foi possivel desativar o pasto. Tente novamente mais tarde.')
    } finally {
      setUpdatingPastoId(null)
    }
  }

  return (
    <div className="pastos-page">
      <PastureHero onCreatePasture={openCreateModal} />

      <PastureSummaryCards pastos={pastos} />

      <PastureFilters
        filters={filters}
        tiposPastagem={tiposPastagem}
        viewMode={viewMode}
        onFilter={setFilters}
        onClear={() => setFilters({})}
        onViewModeChange={setViewMode}
      />

      <div className="pasture-list-header">
        <div>
          <span>{filteredPastos.length}</span>
          <p>{filteredPastos.length === 1 ? 'pasto encontrado' : 'pastos encontrados'}</p>
        </div>
        <button type="button" className="secondary-action" onClick={() => loadPastos(true)} disabled={isLoading}>
          <RefreshCcw size={16} aria-hidden="true" />
          Atualizar
        </button>
      </div>

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
      {error && (
        <div className="pastos-error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <section className="pasture-grid" aria-label="Carregando pastos">
          {Array.from({ length: 6 }).map((_, index) => (
            <article className="pasture-card pasture-card-skeleton" key={index}>
              <i className="skeleton-line skeleton-title" />
              <i className="skeleton-line skeleton-row" />
              <i className="skeleton-line skeleton-row" />
            </article>
          ))}
        </section>
      ) : filteredPastos.length === 0 ? (
        <section className="pastos-empty">
          <h2>Nenhum pasto encontrado.</h2>
          <p>Cadastre um novo pasto ou ajuste os filtros aplicados.</p>
        </section>
      ) : viewMode === 'cards' ? (
        <section className="pasture-grid" aria-label="Lista de pastos em cards">
          {filteredPastos.map((pasto) => (
            <PastureCard
              key={pasto.id}
              pasto={pasto}
              onDetails={openDetailsDrawer}
              onEdit={openEditModal}
              onDeactivate={handleDeactivate}
              isUpdating={updatingPastoId === pasto.id}
            />
          ))}
        </section>
      ) : (
        <PastureTable
          pastos={filteredPastos}
          onDetails={openDetailsDrawer}
          onEdit={openEditModal}
          onDeactivate={handleDeactivate}
          updatingPastoId={updatingPastoId}
        />
      )}

      {detailsPasto && (
        <PastureDetailsDrawer
          pasto={detailsPasto}
          detalhes={details}
          isLoading={isDetailsLoading}
          onClose={() => setDetailsPasto(null)}
          onViewAnimals={() => navigate('/animais')}
          onEdit={(pasto) => {
            setDetailsPasto(null)
            openEditModal(pasto)
          }}
          onDeactivate={handleDeactivate}
        />
      )}

      {isModalOpen && (
        <PastoModalForm
          key={selectedPasto?.id ?? 'novo-pasto'}
          pasto={selectedPasto}
          isSaving={isSaving}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

function normalizeText(value?: string | number | null) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
