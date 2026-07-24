import { type AnimalDestaque } from '../types/dashboard.types'

type FeaturedAnimalsTableProps = {
  animals: AnimalDestaque[]
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function FeaturedAnimalsTable({ animals }: FeaturedAnimalsTableProps) {
  return (
    <section className="dashboard-card featured-table-card">
      <div className="section-heading">
        <div>
          <h2>Animais em destaque</h2>
          <p>Acompanhamento resumido do rebanho</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Brinco</th>
              <th>Categoria</th>
              <th>Peso</th>
              <th>Status</th>
              <th>Pasto</th>
            </tr>
          </thead>
          <tbody>
            {animals.map((animal) => (
              <tr key={animal.id}>
                <td>{animal.codigoAnimal}</td>
                <td>{animal.raca}</td>
                <td>{numberFormatter.format(animal.pesoKg)} kg</td>
                <td>
                  <span className="status-badge">{formatStatus(animal.status)}</span>
                </td>
                <td>{animal.pastoNome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase())
}
