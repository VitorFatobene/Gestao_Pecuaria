package gestao.pecuaria.backend.dashboard.dto;

import gestao.pecuaria.backend.cotacao.dto.CotacaoBoiResponseDTO;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Métricas e dados consolidados para o painel principal.")
public record DashboardResponseDTO(
        @Schema(description = "Total de animais ativos no sistema.", example = "31")
        Long totalAnimais,
        @Schema(description = "Total de pastos cadastrados.", example = "6")
        Long totalPastos,
        @Schema(description = "Lucro consolidado do mês atual ou resumo financeiro disponível.", example = "24800.00")
        BigDecimal lucroMes,
        @Schema(description = "Quantidade de vendas efetuadas.", example = "9")
        Long totalVendas,
        @Schema(description = "Cotação atual do boi vinda da AgroDocAPI ou do cache Redis.")
        CotacaoBoiResponseDTO cotacaoBoi,
        @Schema(description = "Animais em destaque para acompanhamento.")
        List<AnimalDestaqueDTO> animaisDestaque,
        @Schema(description = "Movimentações recentes de compras e vendas.")
        List<MovimentacaoRecenteDTO> movimentacoesRecentes,
        @Schema(description = "Evolução mensal de receitas e despesas dos últimos 6 meses.")
        List<FinancialChartDTO> evolucaoFinanceira,
        @Schema(description = "Total de parcelas de contas a pagar ainda não quitadas.")
        BigDecimal totalAPagar,
        @Schema(description = "Total de parcelas vencidas de contas a pagar.")
        BigDecimal totalVencido,
        @Schema(description = "Quantidade de parcelas vencidas de contas a pagar.")
        Long quantidadeVencidas,
        @Schema(description = "Valor a vencer nos próximos 7 dias.")
        BigDecimal valorProximos7Dias,
        @Schema(description = "Próximos vencimentos de contas a pagar.")
        List<ProximoVencimentoContaPagarDTO> proximosVencimentos
) {
}
