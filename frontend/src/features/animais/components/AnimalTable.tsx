import { Edit3, Eye, PowerOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { type Animal } from '../types/animal.types'

type AnimalTableProps = {
  animais: Animal[]
  onDeactivate: (animal: Animal) => void
  deactivatingAnimalId: number | null
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

function getStatusClass(status: Animal['status']) {
  if (status === 'ATIVO') {
    return 'is-active'
  }

  if (status === 'VENDIDO') {
    return 'is-sold'
  }

  return 'is-inactive'
}

export function AnimalTable({ animais, onDeactivate, deactivatingAnimalId }: AnimalTableProps) {
  const navigate = useNavigate()

  return (
    <section className="animais-table-card">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Raca</th>
              <th>Peso</th>
              <th>Pasto</th>
              <th>Valor Pago</th>
              <th>Data Compra</th>
              <th>Status</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {animais.map((animal) => (
              <tr key={animal.id}>
                <td>{animal.codigoAnimal}</td>
                <td>{animal.raca}</td>
                <td>{numberFormatter.format(animal.pesoKg)} kg</td>
                <td>{animal.pasto?.nome ?? 'Sem pasto'}</td>
                <td>{currencyFormatter.format(animal.valorPago)}</td>
                <td>{dateFormatter.format(new Date(`${animal.dataCompra}T00:00:00Z`))}</td>
                <td>
                  <span className={`animal-status ${getStatusClass(animal.status)}`}>{animal.status}</span>
                </td>
                <td>
                  <div className="table-actions">
                    <button type="button" className="icon-text-button" onClick={() => navigate(`/animais/${animal.id}`)}>
                      <Eye size={15} aria-hidden="true" />
                      Detalhes
                    </button>
                    <button
                      type="button"
                      className="icon-text-button"
                      onClick={() => navigate(`/animais/${animal.id}/editar`)}
                    >
                      <Edit3 size={15} aria-hidden="true" />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="icon-text-button danger-text-button"
                      disabled={animal.status === 'INATIVO' || deactivatingAnimalId === animal.id}
                      onClick={() => onDeactivate(animal)}
                    >
                      <PowerOff size={15} aria-hidden="true" />
                      Desativar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

