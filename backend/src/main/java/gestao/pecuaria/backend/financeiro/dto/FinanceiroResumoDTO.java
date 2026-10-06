package gestao.pecuaria.backend.financeiro.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Resumo financeiro e operacional da propriedade.")
public record FinanceiroResumoDTO(
        @Schema(description = "Soma de valores pagos e fretes dos animais comprados.", example = "87500.00")
        BigDecimal totalGasto,
        @Schema(description = "Soma dos valores de venda registrados.", example = "112300.00")
        BigDecimal ganhoTotal,
        @Schema(description = "Diferença entre ganho total e total gasto.", example = "24800.00")
        BigDecimal lucroTotal,
        @Schema(description = "Receitas efetivamente recebidas de pagamentos de vendas.", example = "60200.00")
        BigDecimal receitasRealizadas,
        @Schema(description = "Receitas pendentes de recebimento.", example = "22500.00")
        BigDecimal receitasAReceber,
        @Schema(description = "Despesas efetivamente pagas em contas a pagar.", example = "15400.00")
        BigDecimal despesasRealizadas,
        @Schema(description = "Despesas pendentes em contas a pagar não canceladas.", example = "7300.00")
        BigDecimal despesasAPagar,
        @Schema(description = "Despesas vencidas e ainda não pagas.", example = "1200.00")
        BigDecimal despesasVencidas,
        @Schema(description = "Saldo de caixa realizado: receitas realizadas menos despesas realizadas.", example = "44800.00")
        BigDecimal saldoRealizado,
        @Schema(description = "Saldo projetado considerando pendências a receber e a pagar.", example = "60000.00")
        BigDecimal saldoProjetado,
        @Schema(description = "Quantidade total de animais cadastrados.", example = "42")
        Integer totalAnimaisCadastrados,
        @Schema(description = "Quantidade de animais ativos.", example = "31")
        Integer totalAnimaisAtivos,
        @Schema(description = "Quantidade de animais vendidos.", example = "9")
        Integer totalAnimaisVendidos,
        @Schema(description = "Quantidade de animais inativos.", example = "2")
        Integer totalAnimaisInativos,
        @Schema(description = "Quantidade total de pastos cadastrados.", example = "6")
        Integer totalPastosCadastrados,
        @Schema(description = "Quantidade total de vendas realizadas.", example = "9")
        Integer totalVendasRealizadas
) {
}
