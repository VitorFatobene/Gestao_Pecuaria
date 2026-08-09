package gestao.pecuaria.backend.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Ponto mensal da evolucao financeira do dashboard.")
public record FinancialChartDTO(
        @Schema(description = "Mes abreviado.", example = "Jan")
        String mes,
        @Schema(description = "Total de receitas no mes.", example = "25000.00")
        BigDecimal receitas,
        @Schema(description = "Total de despesas no mes.", example = "12000.00")
        BigDecimal despesas
) {
}
