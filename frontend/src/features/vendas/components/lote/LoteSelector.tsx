import { AlertCircle, Boxes } from 'lucide-react'
import { useEffect, useState } from 'react'
import { buscarLotePorId, buscarLotes } from '../../../lotes/services/loteService'
import { type Lote } from '../../../lotes/types/lote.types'

type LoteSelectorProps = {
  selectedLoteId: number | null
  error?: string
  onSelect: (lote: Lote | null) => void
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function LoteSelector({ selectedLoteId, error, onSelect }: LoteSelectorProps) {
  const [lotes, setLotes] = useState<Lote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLotes() {
      try {
        setIsLoading(true)
        setLoadError(null)
        const data = await buscarLotes()
        setLotes(data.filter((lote) => lote.status === 'ABERTO'))
      } catch {
        setLoadError('Nao foi possivel carregar os lotes abertos.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadLotes()
  }, [])

  async function handleChange(value: string) {
    const loteId = Number(value)

    if (!loteId) {
      onSelect(null)
      return
    }

    try {
      setIsLoadingDetails(true)
      setLoadError(null)
      const lote = await buscarLotePorId(loteId)
      onSelect(lote)
    } catch {
      setLoadError('Nao foi possivel carregar os detalhes do lote.')
      onSelect(null)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  return (
    <section className="venda-lote-card">
      <div className="venda-lote-section-title">
        <Boxes size={18} aria-hidden="true" />
        <div>
          <span>Selecao de lote</span>
          <h2>Lote aberto para venda</h2>
        </div>
      </div>

      <label className="venda-lote-field">
        Lote
        <select value={selectedLoteId ?? ''} onChange={(event) => void handleChange(event.target.value)} disabled={isLoading || isLoadingDetails}>
          <option value="">
            {isLoading ? 'Carregando lotes...' : 'Selecione um lote aberto'}
          </option>
          {lotes.map((lote) => (
            <option key={lote.id} value={lote.id}>
              {formatLoteOption(lote)}
            </option>
          ))}
        </select>
      </label>

      {!isLoading && !loadError && lotes.length === 0 && (
        <div className="venda-lote-empty">Nenhum lote aberto disponivel para venda.</div>
      )}

      {(error || loadError) && (
        <div className="venda-lote-inline-error" role="alert">
          <AlertCircle size={15} aria-hidden="true" />
          {error ?? loadError}
        </div>
      )}
    </section>
  )
}

function formatLoteOption(lote: Lote) {
  return `${lote.nome} - ${lote.quantidadeAnimais} animais - ${numberFormatter.format(lote.pesoTotalKg)} kg`
}
