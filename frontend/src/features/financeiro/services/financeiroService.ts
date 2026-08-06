import { api } from '../../../services/api'
import { type FinanceiroResumo } from '../types/financeiro.types'

export const financeiroService = {
  buscarResumoFinanceiro: async (): Promise<FinanceiroResumo> => {
    const response = await api.get<FinanceiroResumo>('/financeiro/resumo')
    return response.data
  },
}
