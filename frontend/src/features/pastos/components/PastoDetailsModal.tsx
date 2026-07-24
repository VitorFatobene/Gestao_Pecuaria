import { UserMinus, X } from 'lucide-react'
import { type AnimalPasto, type Pasto } from '../types/pastos.types'

type PastoDetailsModalProps = {
  pasto: Pasto
  animais: AnimalPasto[]
  isLoading: boolean
  removingAnimalId: number | null
  onClose: () => void
  onRemoveAnimal: (animal: AnimalPasto) => void
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function PastoDetailsModal({
  pasto,
  animais,
  isLoading,
  removingAnimalId,
  onClose,
  onRemoveAnimal,
}: PastoDetailsModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="pasto-modal pasto-details-modal" role="dialog" aria-modal="true" aria-labelledby="pasto-details-title">
        <div className="pasto-modal-header">
          <div>
            <span>Detalhes do pasto</span>
            <h2 id="pasto-details-title">{pasto.nome}</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar modal">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="pasto-details-grid">
          <DetailItem label="Nome" value={pasto.nome} />
          <DetailItem label="Tamanho" value={`${numberFormatter.format(pasto.areaHectares)} ha`} />
          <DetailItem label="Status" value={pasto.ativo ? 'Ativo' : 'Inativo'} />
          <DetailItem label="Animais no pasto" value={numberFormatter.format(animais.length)} />
        </div>

        {pasto.descricao && (
          <div className="pasto-details-description">
            <span>Descricao</span>
            <p>{pasto.descricao}</p>
          </div>
        )}

        <div className="pasto-animals-list">
          <div className="pasto-animals-list-header">
            <h3>Animais presentes</h3>
          </div>

          {isLoading ? (
            <p className="pasto-details-empty">Carregando animais...</p>
          ) : animais.length === 0 ? (
            <p className="pasto-details-empty">Nenhum animal ativo neste pasto.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Raca</th>
                    <th>Sexo</th>
                    <th>Peso</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {animais.map((animal) => (
                    <tr key={animal.id}>
                      <td>{animal.codigoAnimal}</td>
                      <td>{animal.raca || '-'}</td>
                      <td>{formatValue(animal.sexo)}</td>
                      <td>{animal.pesoKg ? `${numberFormatter.format(animal.pesoKg)} kg` : '-'}</td>
                      <td>
                        <button
                          type="button"
                          className="icon-text-button danger-text-button"
                          disabled={removingAnimalId === animal.id}
                          onClick={() => onRemoveAnimal(animal)}
                        >
                          <UserMinus size={15} aria-hidden="true" />
                          {removingAnimalId === animal.id ? 'Removendo...' : 'Remover'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

type DetailItemProps = {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="pasto-detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function formatValue(value?: string | null) {
  return value ? value.toLowerCase() : '-'
}
