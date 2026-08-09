import { type FeaturedAnimal } from '../dashboard.types'

type FeaturedAnimalsTableProps = {
  animals: FeaturedAnimal[]
  isLoading?: boolean
}

export function FeaturedAnimalsTable({ animals, isLoading = false }: FeaturedAnimalsTableProps) {
  return (
    <section className="dashboard-card featured-table-card">
      <div className="section-heading">
        <div>
          <h2>Animais em destaque</h2>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Identificacao</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Idade</th>
              <th>Peso</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={6}>
                    <i className="skeleton-line skeleton-row" />
                  </td>
                </tr>
              ))}

            {!isLoading && animals.map((animal) => (
              <tr key={animal.id}>
                <td>{animal.identification}</td>
                <td>{animal.name}</td>
                <td>{animal.category}</td>
                <td>{animal.age}</td>
                <td>{animal.weight}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(animal.status)}`}>{animal.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function getStatusClass(status: string) {
  const normalizedStatus = status.toLowerCase()

  if (normalizedStatus.includes('prenhe')) {
    return 'is-pregnant'
  }

  if (normalizedStatus.includes('engorda')) {
    return 'is-feeding'
  }

  return 'is-available'
}
