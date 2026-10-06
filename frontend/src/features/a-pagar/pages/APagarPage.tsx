import axios from 'axios'
import { Plus, RefreshCcw, WalletCards } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import contasHeroImage from '../../../assets/images/dashboard-hero-farm.jpg'
import { NotificationPopup } from '../../../components/NotificationPopup'
import { PageHero } from '../../../components/PageHero'
import { ConfirmModal } from '../../lotes/components/ConfirmModal'
import { ContaPagarCard } from '../components/ContaPagarCard'
import { ContaPagarDetailsModal } from '../components/ContaPagarDetailsModal'
import { ContaPagarFilters } from '../components/ContaPagarFilters'
import { ContaPagarModal } from '../components/ContaPagarModal'
import { ContaPagarSummary } from '../components/ContaPagarSummary'
import { ContaPagarTable } from '../components/ContaPagarTable'
import { RegistrarPagamentoModal } from '../components/RegistrarPagamentoModal'
import { contaPagarService } from '../services/contaPagarService'
import {
  type ContaPagar,
  type ContaPagarFilters as ContaPagarFiltersType,
  type ContaPagarResumo,
  type CriarContaPagarRequest,
  type ParcelaContaPagar,
  type RegistrarPagamentoParcelaRequest,
} from '../types/contaPagar.types'

export function APagarPage() {
  const [contas, setContas] = useState<ContaPagar[]>([])
  const [resumo, setResumo] = useState<ContaPagarResumo | null>(null)
  const [filters, setFilters] = useState<ContaPagarFiltersType>({})
  const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null)
  const [pendingPayment, setPendingPayment] = useState<ParcelaContaPagar | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isListLoading, setIsListLoading] = useState(true)
  const [isSummaryLoading, setIsSummaryLoading] = useState(true)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const hasFilters = Object.values(filters).some(Boolean)

  const loadContas = useCallback(async (nextFilters: ContaPagarFiltersType = {}, showSuccessPopup = false) => {
    try {
      setIsListLoading(true)
      setError(null)
      const data = await contaPagarService.listar(nextFilters)
      setContas(data)

      if (showSuccessPopup) {
        setFeedback('Dados atualizados com sucesso.')
      }
    } catch {
      setError('Não foi possível carregar as contas.')
    } finally {
      setIsListLoading(false)
    }
  }, [])

  const loadResumo = useCallback(async () => {
    try {
      setIsSummaryLoading(true)
      setSummaryError(null)
      const data = await contaPagarService.buscarResumo()
      setResumo(data)
    } catch {
      setSummaryError('Não foi possível carregar o resumo.')
    } finally {
      setIsSummaryLoading(false)
    }
  }, [])

  const refreshPageData = useCallback(async (nextFilters: ContaPagarFiltersType = filters) => {
    await Promise.all([loadContas(nextFilters), loadResumo()])
  }, [filters, loadContas, loadResumo])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void Promise.all([loadContas({}), loadResumo()])
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadContas, loadResumo])

  async function handleFilter(nextFilters: ContaPagarFiltersType) {
    setFeedback(null)
    setFilters(nextFilters)
    await loadContas(nextFilters)
  }

  async function handleClearFilters() {
    setFeedback(null)
    setFilters({})
    await loadContas({})
  }

  async function handleRefresh() {
    await refreshPageData(filters)
    setFeedback('Dados atualizados com sucesso.')
  }

  async function handleCreate(data: CriarContaPagarRequest) {
    try {
      setIsSaving(true)
      setError(null)
      await contaPagarService.criar(data)
      setIsCreateModalOpen(false)
      setFeedback('Conta cadastrada com sucesso.')
      await refreshPageData(filters)
    } catch (requestError) {
      setError(getFriendlyError(requestError, 'Não foi possível cadastrar a conta.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function openDetails(conta: ContaPagar) {
    try {
      setSelectedConta(conta)
      setIsDetailsLoading(true)
      setError(null)
      const data = await contaPagarService.buscarPorId(conta.id)
      setSelectedConta(data)
    } catch {
      setError('Não foi possível carregar os detalhes da conta.')
    } finally {
      setIsDetailsLoading(false)
    }
  }

  async function refreshSelectedConta(contaId: number) {
    try {
      setIsDetailsLoading(true)
      const data = await contaPagarService.buscarPorId(contaId)
      setSelectedConta(data)
    } catch {
      setError('Não foi possível atualizar os detalhes da conta.')
    } finally {
      setIsDetailsLoading(false)
    }
  }

  async function handleRegisterPayment(data: RegistrarPagamentoParcelaRequest) {
    if (!pendingPayment || !selectedConta) {
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      const updatedConta = await contaPagarService.registrarPagamento(pendingPayment.id, data)
      setSelectedConta(updatedConta)
      setPendingPayment(null)
      setFeedback('Pagamento registrado com sucesso.')
      await refreshPageData(filters)
    } catch (requestError) {
      setError(getFriendlyError(requestError, 'Não foi possível registrar o pagamento.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleConfirmCancel() {
    if (!selectedConta) {
      return
    }

    try {
      setIsCancelling(true)
      setError(null)
      const updatedConta = await contaPagarService.cancelar(selectedConta.id)
      setSelectedConta(updatedConta)
      setIsCancelModalOpen(false)
      setFeedback('Conta cancelada com sucesso.')
      await refreshPageData(filters)
      await refreshSelectedConta(updatedConta.id)
    } catch (requestError) {
      setError(getFriendlyError(requestError, 'Esta conta não pode ser cancelada.'))
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="conta-pagar-page">
      <PageHero
        label="CONTROLE FINANCEIRO"
        title="Contas a pagar"
        description="Acompanhe compras, parcelas e vencimentos para manter as obrigações da fazenda sob controle."
        image={contasHeroImage}
        action={
          <button type="button" className="page-hero-action" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={17} aria-hidden="true" />
            Nova conta
          </button>
        }
      />

      <ContaPagarSummary resumo={resumo} isLoading={isSummaryLoading} />

      {summaryError && (
        <div className="conta-pagar-warning" role="alert">
          {summaryError}
        </div>
      )}

      <ContaPagarFilters
        filters={filters}
        isLoading={isListLoading}
        onFilter={handleFilter}
        onClear={handleClearFilters}
      />

      <div className="conta-pagar-list-header">
        <div>
          <span>{contas.length}</span>
          <p>{contas.length === 1 ? 'conta encontrada' : 'contas encontradas'}</p>
        </div>
        <button type="button" className="secondary-action" onClick={handleRefresh} disabled={isListLoading || isSummaryLoading}>
          <RefreshCcw size={16} aria-hidden="true" />
          Atualizar
        </button>
      </div>

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
      {error && (
        <div className="conta-pagar-error" role="alert">
          {error}
        </div>
      )}

      {isListLoading ? (
        <ContaPagarSkeleton />
      ) : contas.length === 0 ? (
        <section className="conta-pagar-empty">
          <div className="conta-pagar-empty-icon">
            <WalletCards size={24} aria-hidden="true" />
          </div>
          <h2>{hasFilters ? 'Nenhuma conta encontrada com esses filtros.' : 'Nenhuma conta cadastrada'}</h2>
          <p>
            {hasFilters
              ? 'Ajuste os critérios para encontrar outras obrigações da fazenda.'
              : 'Cadastre compras de animais, ração ou suplementos para acompanhar seus próximos pagamentos.'}
          </p>
          {hasFilters ? (
            <button type="button" className="secondary-action" onClick={handleClearFilters}>
              Limpar filtros
            </button>
          ) : (
            <button type="button" className="primary-action" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} aria-hidden="true" />
              Nova conta
            </button>
          )}
        </section>
      ) : (
        <>
          <div className="conta-pagar-desktop-list">
            <ContaPagarTable contas={contas} onViewDetails={openDetails} />
          </div>

          <section className="conta-pagar-mobile-list" aria-label="Lista de contas a pagar">
            {contas.map((conta) => (
              <ContaPagarCard key={conta.id} conta={conta} onViewDetails={openDetails} />
            ))}
          </section>
        </>
      )}

      {isCreateModalOpen && (
        <ContaPagarModal isSaving={isSaving} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreate} />
      )}

      {selectedConta && (
        <ContaPagarDetailsModal
          conta={selectedConta}
          isLoading={isDetailsLoading}
          isCancelling={isCancelling}
          onClose={() => setSelectedConta(null)}
          onPayInstallment={setPendingPayment}
          onCancelAccount={() => setIsCancelModalOpen(true)}
        />
      )}

      {pendingPayment && selectedConta && (
        <RegistrarPagamentoModal
          parcela={pendingPayment}
          totalParcelas={selectedConta.quantidadeParcelas}
          isSaving={isSaving}
          onClose={() => setPendingPayment(null)}
          onSubmit={handleRegisterPayment}
        />
      )}

      {isCancelModalOpen && (
        <ConfirmModal
          title="Cancelar esta conta?"
          message="As parcelas ainda pendentes serão canceladas. Pagamentos já registrados serão preservados."
          cancelLabel="Voltar"
          confirmLabel="Confirmar cancelamento"
          tone="danger"
          isLoading={isCancelling}
          onCancel={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  )
}

function ContaPagarSkeleton() {
  return (
    <section className="conta-pagar-mobile-list" aria-label="Carregando contas a pagar">
      {Array.from({ length: 4 }).map((_, index) => (
        <article className="conta-pagar-card conta-pagar-card-skeleton" key={index}>
          <i className="skeleton-line skeleton-title" />
          <i className="skeleton-line skeleton-row" />
          <i className="skeleton-line skeleton-row" />
        </article>
      ))}
    </section>
  )
}

function getFriendlyError(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
    const message = error.response?.data?.message ?? error.response?.data?.error

    if (message && message.length < 180) {
      return message
    }
  }

  return fallback
}
