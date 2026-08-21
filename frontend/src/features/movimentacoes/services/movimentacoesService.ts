import { api } from '../../../services/api'
import { type MovimentacaoAnimal, type MovimentacaoFilters } from '../types/movimentacoes.types'

export const listarMovimentacoes = async (filters: MovimentacaoFilters = {}): Promise<MovimentacaoAnimal[]> => {
  const params = {
    animalId: filters.animalId,
    pastoId: filters.pastoId,
    inicio: filters.inicio,
    fim: filters.fim,
  }

  const response = await api.get<MovimentacaoAnimal[]>('/movimentacoes', { params })
  return response.data
}
