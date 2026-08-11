package gestao.pecuaria.backend.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Movimentação recente exibida no painel principal.")
public record MovimentacaoRecenteDTO(
        @Schema(description = "Tipo da movimentação.", example = "VENDA")
        String tipo,
        @Schema(description = "Descrição resumida da movimentação.", example = "Venda do lote Nelore Setembro para Frigorífico Norte")
        String descricao,
        @Schema(description = "Data da movimentação no formato ISO-8601.", example = "2026-07-24")
        String data,
        @Schema(description = "Valor financeiro associado à movimentação, quando houver.", example = "5300.00")
        BigDecimal valor
) {
}
