import { useMemo } from 'react'
import { calcularValorPorArroba, formatarArrobas, formatarPesoKg, isPesoInformado } from '../../../utils/peso'

type AnimalComPeso = {
  pesoKg?: unknown
}

type ValorPorArrobaPreviewProps = {
  animais: readonly AnimalComPeso[]
  valorTotal: number
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ValorPorArrobaPreview({ animais, valorTotal }: ValorPorArrobaPreviewProps) {
  const preview = useMemo(() => {
    if (animais.length === 0) {
      return { value: '—', detail: 'Selecione animais para calcular.' }
    }

    if (animais.some((animal) => !isPesoInformado(animal.pesoKg))) {
      return { value: 'Não disponível', detail: 'Peso de um ou mais animais não informado.' }
    }

    const pesoTotalKg = animais.reduce<number>((total, animal) => total + (animal.pesoKg as number), 0)

    if (!isPesoInformado(pesoTotalKg)) {
      return { value: 'Não disponível', detail: 'O peso selecionado deve ser maior que zero.' }
    }

    if (!Number.isFinite(valorTotal) || valorTotal <= 0) {
      return {
        value: '—',
        detail: `${formatarPesoKg(pesoTotalKg)} · ${formatarArrobas(pesoTotalKg)}`,
      }
    }

    const valorPorArroba = calcularValorPorArroba(valorTotal, pesoTotalKg)

    return {
      value: valorPorArroba === null ? 'Não disponível' : `${currencyFormatter.format(valorPorArroba)}/@`,
      detail: `${formatarPesoKg(pesoTotalKg)} · ${formatarArrobas(pesoTotalKg)}`,
    }
  }, [animais, valorTotal])

  return (
    <section className="valor-por-arroba-preview" aria-live="polite" aria-label="Prévia do valor por arroba">
      <span>Valor por @</span>
      <strong>{preview.value}</strong>
      <small>{preview.detail}</small>
    </section>
  )
}
