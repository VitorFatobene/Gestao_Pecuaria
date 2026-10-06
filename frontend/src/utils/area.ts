export const HECTARES_POR_ALQUEIRE_PAULISTA = 2.42

export function hectaresParaAlqueiresPaulistas(hectares: number): number {
  return hectares / HECTARES_POR_ALQUEIRE_PAULISTA
}

export function alqueiresPaulistasParaHectares(alqueires: number): number {
  return alqueires * HECTARES_POR_ALQUEIRE_PAULISTA
}

export function formatarAreaEmAlqueiresPaulistas(hectares: number | null | undefined): string {
  if (hectares == null) {
    return '-'
  }

  return `${hectaresParaAlqueiresPaulistas(hectares).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} alq.`
}
