const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

export function isPesoInformado(pesoKg: unknown): pesoKg is number {
  return typeof pesoKg === 'number' && Number.isFinite(pesoKg) && pesoKg > 0
}

export function kgParaArrobas(pesoKg: number): number {
  return pesoKg / 30
}

export function formatarPesoKg(pesoKg: unknown): string | null {
  return isPesoInformado(pesoKg) ? `${numberFormatter.format(pesoKg)} kg` : null
}

export function formatarArrobas(pesoKg: unknown): string | null {
  return isPesoInformado(pesoKg) ? `${numberFormatter.format(kgParaArrobas(pesoKg))} @` : null
}
