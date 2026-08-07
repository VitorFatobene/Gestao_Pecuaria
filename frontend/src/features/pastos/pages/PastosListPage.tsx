import { Grid2X2, List, Plus, RefreshCcw, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { NotificationPopup } from '../../../components/NotificationPopup'
import { PastoCard } from '../components/PastoCard'
import { PastoDetailsModal } from '../components/PastoDetailsModal'
import { PastoModalForm } from '../components/PastoModalForm'
import { PastoTable } from '../components/PastoTable'
import {
  ativarPasto,
  createPasto,
  desativarPasto,
  getAnimaisAtivosByPasto,
  getAnimaisAtivosCountByPasto,
  getPastos,
  removerAnimalDoPasto,
  updatePasto,
} from '../services/pastosService'
import {
  type AnimalPasto,
  type Pasto,
  type PastoRequestDTO,
  type PastoStatusFilter,
  type PastoViewMode,
} from '../types/pastos.types'

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function PastosListPage() {
  const [pastos, setPastos] = useState<Pasto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PastoStatusFilter>('todos')
  const [viewMode, setViewMode] = useState<PastoViewMode>('cards')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [updatingPastoId, setUpdatingPastoId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPasto, setSelectedPasto] = useState<Pasto | null>(null)
  const [detailsPasto, setDetailsPasto] = useState<Pasto | null>(null)
  const [detailsAnimais, setDetailsAnimais] = useState<AnimalPasto[]>([])
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)
  const [removingAnimalId, setRemovingAnimalId] = useState<number | null>(null)

  const filteredPastos = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return pastos.filter((pasto) => {
      const matchesSearch = pasto.nome.toLowerCase().includes(normalizedSearch)
      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'ativos' && pasto.ativo) ||
        (statusFilter === 'inativos' && !pasto.ativo)

      return matchesSearch && matchesStatus
    })
  }, [pastos, searchTerm, statusFilter])

  const metrics = useMemo(() => {
    const totalPastos = pastos.length
    const pastosAtivos = pastos.filter((pasto) => pasto.ativo).length
    const pastosInativos = totalPastos - pastosAtivos
    const areaTotal = pastos.reduce((total, pasto) => total + pasto.areaHectares, 0)

    return {
      totalPastos,
      pastosAtivos,
      pastosInativos,
      areaTotal,
    }
  }, [pastos])

  const withAnimaisAtivosCount = useCallback(async (pastosToCount: Pasto[]) => {
    return Promise.all(
      pastosToCount.map(async (pasto) => ({
        ...pasto,
        animaisAtivos: await getAnimaisAtivosCountByPasto(pasto.id),
      })),
    )
  }, [])

  const loadPastos = useCallback(async (showSuccessPopup = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getPastos()
      setPastos(await withAnimaisAtivosCount(data))
      if (showSuccessPopup) {
        setFeedback('Dados atualizados com sucesso.')
      }
    } catch {
      setError('Nao foi possivel carregar os pastos. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }, [withAnimaisAtivosCount])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPastos()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadPastos])

  async function withAnimaisAtivosCountForPasto(pasto: Pasto) {
    return {
      ...pasto,
      animaisAtivos: await getAnimaisAtivosCountByPasto(pasto.id),
    }
  }

  function openCreateModal() {
    setSelectedPasto(null)
    setFeedback(null)
    setIsModalOpen(true)
  }

  function openEditModal(pasto: Pasto) {
    setSelectedPasto(pasto)
    setFeedback(null)
    setIsModalOpen(true)
  }

  async function openDetailsModal(pasto: Pasto) {
    try {
      setDetailsPasto(pasto)
      setDetailsAnimais([])
      setIsDetailsLoading(true)
      setError(null)

      const animais = await getAnimaisAtivosByPasto(pasto.id)
      setDetailsAnimais(animais)
      setPastos((currentPastos) =>
        currentPastos.map((currentPasto) =>
          currentPasto.id === pasto.id ? { ...currentPasto, animaisAtivos: animais.length } : currentPasto,
        ),
      )
    } catch {
      setDetailsPasto(null)
      setError('Nao foi possivel carregar os detalhes do pasto. Tente novamente mais tarde.')
    } finally {
      setIsDetailsLoading(false)
    }
  }

  async function handleRemoveAnimalFromPasto(animal: AnimalPasto) {
    if (!detailsPasto) {
      return
    }

    const confirmed = window.confirm(`Deseja remover o animal ${animal.codigoAnimal} do pasto "${detailsPasto.nome}"?`)

    if (!confirmed) {
      return
    }

    try {
      setRemovingAnimalId(animal.id)
      setError(null)
      await removerAnimalDoPasto(animal.id)

      const nextAnimais = detailsAnimais.filter((currentAnimal) => currentAnimal.id !== animal.id)

      setDetailsAnimais(nextAnimais)
      setPastos((currentPastos) =>
        currentPastos.map((currentPasto) =>
          currentPasto.id === detailsPasto.id ? { ...currentPasto, animaisAtivos: nextAnimais.length } : currentPasto,
        ),
      )
      setDetailsPasto({ ...detailsPasto, animaisAtivos: nextAnimais.length })
      setFeedback('Animal removido do pasto com sucesso.')
    } catch {
      setError('Nao foi possivel remover o animal do pasto. Tente novamente mais tarde.')
    } finally {
      setRemovingAnimalId(null)
    }
  }

  async function handleSubmit(data: PastoRequestDTO) {
    try {
      setIsSaving(true)
      setError(null)

      const savedPastoWithoutCount = selectedPasto
        ? await updatePasto(selectedPasto.id, data)
        : await createPasto(data)
      const savedPasto = await withAnimaisAtivosCountForPasto(savedPastoWithoutCount)

      setPastos((currentPastos) => {
        if (!selectedPasto) {
          return [savedPasto, ...currentPastos]
        }

        return currentPastos.map((pasto) => (pasto.id === savedPasto.id ? savedPasto : pasto))
      })
      setFeedback(selectedPasto ? 'Pasto atualizado com sucesso.' : 'Pasto criado com sucesso.')
      setIsModalOpen(false)
      setSelectedPasto(null)
    } catch {
      setError('Nao foi possivel salvar o pasto. Revise os dados e tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleStatus(pasto: Pasto) {
    const action = pasto.ativo ? 'desativar' : 'ativar'
    const confirmed = window.confirm(`Deseja ${action} o pasto "${pasto.nome}"?`)

    if (!confirmed) {
      return
    }

    try {
      setUpdatingPastoId(pasto.id)
      setError(null)
      const updatedPastoWithoutCount = pasto.ativo ? await desativarPasto(pasto.id) : await ativarPasto(pasto.id)
      const updatedPasto = await withAnimaisAtivosCountForPasto(updatedPastoWithoutCount)

      setPastos((currentPastos) =>
        currentPastos.map((currentPasto) =>
          currentPasto.id === updatedPasto.id ? updatedPasto : currentPasto,
        ),
      )
      setFeedback(updatedPasto.ativo ? 'Pasto ativado com sucesso.' : 'Pasto removido com sucesso.')
    } catch {
      setError(`Nao foi possivel ${action} o pasto. Tente novamente mais tarde.`)
    } finally {
      setUpdatingPastoId(null)
    }
  }

  return (
    <div className="pastos-page">
      <section className="pastos-page-header">
        <div>
          <span>Pastos e piquetes</span>
          <h1>Gestao de Pastos e Piquetes</h1>
          <p>Controle area, descricao e disponibilidade dos piquetes da fazenda.</p>
        </div>
        <button type="button" className="primary-action" onClick={openCreateModal}>
          <Plus size={18} aria-hidden="true" />
          Novo Pasto
        </button>
      </section>

      <section className="pastos-metrics" aria-label="Resumo dos pastos">
        <MetricCard label="Total de pastos" value={metrics.totalPastos} />
        <MetricCard label="Pastos ativos" value={metrics.pastosAtivos} />
        <MetricCard label="Pastos inativos" value={metrics.pastosInativos} />
        <MetricCard label="Area total" value={metrics.areaTotal} suffix="ha" />
      </section>

      <section className="pastos-toolbar">
        <label className="pastos-search">
          <Search size={17} aria-hidden="true" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome do pasto"
          />
        </label>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PastoStatusFilter)}>
          <option value="todos">Todos</option>
          <option value="ativos">Apenas ativos</option>
          <option value="inativos">Apenas inativos</option>
        </select>

        <div className="view-toggle" aria-label="Alternar visualizacao">
          <button
            type="button"
            className={viewMode === 'cards' ? 'is-selected' : ''}
            onClick={() => setViewMode('cards')}
            aria-label="Visualizar cards"
          >
            <Grid2X2 size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={viewMode === 'table' ? 'is-selected' : ''}
            onClick={() => setViewMode('table')}
            aria-label="Visualizar tabela"
          >
            <List size={18} aria-hidden="true" />
          </button>
        </div>

        <button type="button" className="secondary-action" onClick={() => loadPastos(true)} disabled={isLoading}>
          <RefreshCcw size={16} aria-hidden="true" />
          Atualizar
        </button>
      </section>

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
      {error && (
        <div className="pastos-error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="pastos-loading">Carregando pastos...</div>
      ) : filteredPastos.length === 0 ? (
        <section className="pastos-empty">
          <h2>Nenhum pasto encontrado</h2>
          <p>Ajuste os filtros ou cadastre um novo pasto.</p>
        </section>
      ) : viewMode === 'cards' ? (
        <section className="pastos-grid" aria-label="Lista de pastos em cards">
          {filteredPastos.map((pasto) => (
            <PastoCard
              key={pasto.id}
              pasto={pasto}
              onEdit={openEditModal}
              onDetails={openDetailsModal}
              onToggleStatus={handleToggleStatus}
              isUpdating={updatingPastoId === pasto.id}
            />
          ))}
        </section>
      ) : (
        <PastoTable
          pastos={filteredPastos}
          onEdit={openEditModal}
          onDetails={openDetailsModal}
          onToggleStatus={handleToggleStatus}
          updatingPastoId={updatingPastoId}
        />
      )}

      {detailsPasto && (
        <PastoDetailsModal
          pasto={detailsPasto}
          animais={detailsAnimais}
          isLoading={isDetailsLoading}
          removingAnimalId={removingAnimalId}
          onClose={() => setDetailsPasto(null)}
          onRemoveAnimal={handleRemoveAnimalFromPasto}
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

type MetricCardProps = {
  label: string
  value: number
  suffix?: string
}

function MetricCard({ label, value, suffix }: MetricCardProps) {
  return (
    <article className="pasto-metric-card">
      <span>{label}</span>
      <strong>
        {numberFormatter.format(value)}
        {suffix ? ` ${suffix}` : ''}
      </strong>
    </article>
  )
}
