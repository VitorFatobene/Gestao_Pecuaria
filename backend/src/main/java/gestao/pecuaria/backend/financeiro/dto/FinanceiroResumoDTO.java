package gestao.pecuaria.backend.financeiro.dto;

import java.math.BigDecimal;

public record FinanceiroResumoDTO(
        BigDecimal totalGasto,
        BigDecimal ganhoTotal,
        BigDecimal lucroTotal,
        Integer totalAnimaisCadastrados,
        Integer totalAnimaisVendidos,
        Integer totalPastosCadastrados
) {
}
