package gestao.pecuaria.backend.financeiro.dto;

import java.math.BigDecimal;

public record FinanceiroResumoDTO(
        BigDecimal totalGasto,
        BigDecimal ganhoTotal,
        BigDecimal lucroTotal,
        Integer totalAnimaisCadastrados,
        Integer totalAnimaisAtivos,
        Integer totalAnimaisVendidos,
        Integer totalAnimaisInativos,
        Integer totalPastosCadastrados,
        Integer totalVendasRealizadas
) {
}
