import {
  Beef,
  CircleDollarSign,
  LineChart,
  ShoppingCart,
  WalletCards,
  Wheat,
} from 'lucide-react'
import {
  type DashboardViewData,
  type RecentMovement,
  type SummaryCardData,
} from './dashboard.types'

export const mockSummaryCards: SummaryCardData[] = [
  {
    icon: Beef,
    title: 'Total de animais',
    value: '1.243',
    indicator: '5,2% vs mes anterior',
    trend: 'up',
  },
  {
    icon: Wheat,
    title: 'Pastos ativos',
    value: '18',
    indicator: '2 novos',
    trend: 'up',
  },
  {
    icon: CircleDollarSign,
    title: 'Vendas do mes',
    value: 'R$ 186.750,00',
    indicator: '18,6%',
    trend: 'up',
  },
  {
    icon: LineChart,
    title: 'Cotacao do boi (@)',
    value: 'R$ 236,50',
    indicator: '2,1% hoje',
    trend: 'up',
  },
]

export const mockRecentMovements: RecentMovement[] = [
  {
    icon: ShoppingCart,
    title: 'Venda realizada',
    description: '15 bois Nelore',
    meta: 'R$ 25.800,00',
    tone: 'sale',
  },
  {
    icon: Beef,
    title: 'Novo animal cadastrado',
    description: 'Nelore - Macho',
    meta: 'Hoje 09:15',
    tone: 'animal',
  },
  {
    icon: WalletCards,
    title: 'Recebimento',
    description: 'Venda de animais',
    meta: 'R$ 17.200,00',
    tone: 'money',
  },
  {
    icon: Wheat,
    title: 'Pastejo iniciado',
    description: 'Pasto Boa Vista 07',
    meta: 'Hoje',
    tone: 'pasture',
  },
]

export const mockFeaturedAnimals = [
  {
    id: 'BRV1023',
    identification: 'BRV1023',
    name: 'Imperador',
    category: 'Touro',
    age: '36 meses',
    weight: '820 kg',
    status: 'Disponivel',
  },
  {
    id: 'BRV0876',
    identification: 'BRV0876',
    name: 'Rainha',
    category: 'Vaca',
    age: '48 meses',
    weight: '600 kg',
    status: 'Prenhe',
  },
  {
    id: 'BRV1567',
    identification: 'BRV1567',
    name: 'Astro',
    category: 'Novilho',
    age: '24 meses',
    weight: '420 kg',
    status: 'Em engorda',
  },
]

export const dashboardMock: DashboardViewData = {
  summaryCards: mockSummaryCards,
  financialData: [],
  recentMovements: mockRecentMovements,
  featuredAnimals: mockFeaturedAnimals,
}
