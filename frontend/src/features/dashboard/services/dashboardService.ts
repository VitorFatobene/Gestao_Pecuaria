import {
  Beef,
  CircleDollarSign,
  Map,
  Plus,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { api } from '../../../services/api'
import {
  type DashboardData,
  type DashboardResponse,
  type MovimentacaoRecenteResponse,
} from '../types/dashboard.types'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

const quickActions = [
  { label: 'Novo animal', path: '/animais', icon: Plus },
  { label: 'Registrar venda', path: '/vendas', icon: ShoppingCart },
  { label: 'Ver pastos', path: '/pastos', icon: Map },
  { label: 'Financeiro', path: '/financeiro', icon: CircleDollarSign },
]

export async function getDashboardData(): Promise<DashboardData> {
  const { data } = await api.get<DashboardResponse>('/dashboard')

  return {
    summary: [
      {
        title: 'Rebanho ativo',
        value: numberFormatter.format(data.totalAnimais),
        description: 'Animais ativos no sistema',
        trend: 'stable',
        icon: Beef,
      },
      {
        title: 'Pastos',
        value: numberFormatter.format(data.totalPastos),
        description: 'Pastos cadastrados',
        trend: 'stable',
        icon: Map,
      },
      {
        title: 'Lucro consolidado',
        value: currencyFormatter.format(data.lucroMes),
        description: 'Resumo financeiro atual',
        trend: data.lucroMes >= 0 ? 'up' : 'down',
        icon: TrendingUp,
      },
      {
        title: 'Vendas',
        value: numberFormatter.format(data.totalVendas),
        description: 'Vendas efetuadas',
        trend: 'stable',
        icon: Wallet,
      },
    ],
    financialSeries: [
      {
        label: 'Lucro',
        value: Math.abs(data.lucroMes),
        kind: 'profit',
      },
      {
        label: 'Cotacao',
        value: data.cotacaoBoi,
        kind: 'reference',
      },
    ],
    recentMovements: data.movimentacoesRecentes.map(toRecentMovement),
    quickActions,
    featuredAnimals: data.animaisDestaque.map((animal) => ({
      id: animal.id,
      brinco: animal.codigoAnimal,
      categoria: animal.raca,
      peso: `${numberFormatter.format(animal.pesoKg)} kg`,
      status: formatStatus(animal.status),
      pasto: animal.pastoNome,
    })),
  }
}

function toRecentMovement(item: MovimentacaoRecenteResponse, index: number) {
  return {
    id: index + 1,
    title: formatMovementTitle(item.tipo),
    description: item.descricao,
    date: formatDate(item.data),
    amount: item.valor != null ? currencyFormatter.format(item.valor) : undefined,
    type: item.tipo === 'VENDA' ? 'sale' : item.tipo === 'COMPRA' ? 'finance' : 'animal',
  } as const
}

function formatMovementTitle(tipo: string) {
  const titles: Record<string, string> = {
    VENDA: 'Venda registrada',
    COMPRA: 'Compra registrada',
    TROCA_PASTO: 'Troca de pasto',
  }

  return titles[tipo] ?? 'Movimentacao'
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${date}T00:00:00`))
}
