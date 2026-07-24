import {
  Beef,
  CircleDollarSign,
  Map,
  Plus,
  Scale,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { type DashboardData } from '../types/dashboard.types'

export function getDashboardData(): DashboardData {
  return {
    summary: [
      {
        title: 'Rebanho ativo',
        value: '248',
        description: '+12 animais no mes',
        trend: 'up',
        icon: Beef,
      },
      {
        title: 'Peso medio',
        value: '412 kg',
        description: 'Estavel na ultima pesagem',
        trend: 'stable',
        icon: Scale,
      },
      {
        title: 'Receita mensal',
        value: 'R$ 86.420',
        description: '+18% vs. mes anterior',
        trend: 'up',
        icon: TrendingUp,
      },
      {
        title: 'Custos operacionais',
        value: 'R$ 31.870',
        description: '-4% vs. mes anterior',
        trend: 'down',
        icon: Wallet,
      },
    ],
    financialSeries: [
      { month: 'Jan', revenue: 58, expense: 31 },
      { month: 'Fev', revenue: 62, expense: 34 },
      { month: 'Mar', revenue: 71, expense: 36 },
      { month: 'Abr', revenue: 68, expense: 32 },
      { month: 'Mai', revenue: 82, expense: 38 },
      { month: 'Jun', revenue: 86, expense: 32 },
    ],
    recentMovements: [
      {
        id: 1,
        title: 'Venda registrada',
        description: '18 animais vendidos para Frigorifico Norte',
        date: 'Hoje',
        amount: 'R$ 42.300',
        type: 'sale',
      },
      {
        id: 2,
        title: 'Nova pesagem',
        description: 'Lote B atualizou media para 417 kg',
        date: 'Ontem',
        type: 'animal',
      },
      {
        id: 3,
        title: 'Despesa lancada',
        description: 'Compra de suplemento mineral',
        date: '22 Jul',
        amount: 'R$ 6.840',
        type: 'finance',
      },
    ],
    quickActions: [
      { label: 'Novo animal', path: '/animais', icon: Plus },
      { label: 'Registrar venda', path: '/vendas', icon: ShoppingCart },
      { label: 'Ver pastos', path: '/pastos', icon: Map },
      { label: 'Financeiro', path: '/financeiro', icon: CircleDollarSign },
    ],
    featuredAnimals: [
      {
        id: 1,
        brinco: 'A-1042',
        categoria: 'Nelore',
        peso: '452 kg',
        status: 'Ativo',
        pasto: 'Pasto 03',
      },
      {
        id: 2,
        brinco: 'B-2210',
        categoria: 'Angus',
        peso: '438 kg',
        status: 'Ativo',
        pasto: 'Pasto 01',
      },
      {
        id: 3,
        brinco: 'C-0871',
        categoria: 'Cruzado',
        peso: '396 kg',
        status: 'Observacao',
        pasto: 'Pasto 04',
      },
    ],
  }
}
