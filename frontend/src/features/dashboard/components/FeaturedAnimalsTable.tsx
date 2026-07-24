import { type FeaturedAnimal } from '../types/dashboard.types'

type FeaturedAnimalsTableProps = {
  animals: FeaturedAnimal[]
}

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
                <td>{animal.brinco}</td>
                <td>{animal.categoria}</td>
                <td>{animal.peso}</td>
                <td>
                  <span className="status-badge">{animal.status}</span>
                </td>
                <td>{animal.pasto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
