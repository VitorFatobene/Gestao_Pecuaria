import { api } from '../../../services/api'

export type MeuPerfil = {
  id: number
  nome: string
  email: string
  nomeFazenda: string
  role: 'USER' | 'ADMIN'
}

export type AtualizarMeuPerfilData = {
  nome: string
  nomeFazenda: string
  senhaAtual?: string
  novaSenha?: string
  confirmacaoNovaSenha?: string
}

export async function buscarMeuPerfil() {
  const response = await api.get<MeuPerfil>('/usuarios/me')

  return response.data
}

export async function atualizarMeuPerfil(data: AtualizarMeuPerfilData) {
  const response = await api.put<MeuPerfil>('/usuarios/me', data)

  return response.data
}
