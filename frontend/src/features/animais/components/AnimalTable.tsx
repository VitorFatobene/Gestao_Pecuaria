import { Eye, Repeat2 } from 'lucide-react'
import { type Animal } from '../types/animal.types'

type AnimalTableProps = {
  animais: Animal[]
  onViewDetails: (animal: Animal) => void
  onChangePasture: (animal: Animal) => void
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

export function AnimalTable({ animais, onViewDetails, onChangePasture }: AnimalTableProps) {
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
              <th>Sexo</th>
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
                <td>{formatSexo(animal.sexo)}</td>
                <td>{currencyFormatter.format(animal.valorPago)}</td>
                <td>{dateFormatter.format(new Date(`${animal.dataCompra}T00:00:00Z`))}</td>
                <td>
                  <span className={`animal-status ${getStatusClass(animal.status)}`}>{formatStatus(animal.status)}</span>
                </td>
                <td>
                  <div className="table-actions">
                    <button type="button" className="icon-text-button" onClick={() => onViewDetails(animal)}>
                      <Eye size={15} aria-hidden="true" />
                      Detalhes
                    </button>
                    <button
                      type="button"
                      className="icon-text-button"
                      disabled={animal.status !== 'ATIVO'}
                      onClick={() => onChangePasture(animal)}
                    >
                      <Repeat2 size={15} aria-hidden="true" />
                      Alterar pasto
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

function formatStatus(status: Animal['status']) {
  const labels: Record<Animal['status'], string> = {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
    VENDIDO: 'Vendido',
  }

  return labels[status]
}

function formatSexo(sexo: Animal['sexo']) {
  if (sexo === 'MACHO') {
    return 'Macho'
  }

  if (sexo === 'FEMEA') {
    return 'Femea'
  }

  return 'Nao informado'
}
