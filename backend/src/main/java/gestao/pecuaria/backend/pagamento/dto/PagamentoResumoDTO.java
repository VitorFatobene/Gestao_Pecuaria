package gestao.pecuaria.backend.pagamento.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resumo da condição de pagamento da venda.")
public record PagamentoResumoDTO(
        @Schema(description = "Tipo de pagamento utilizado.", example = "PARCELADO")
        String tipoPagamento,
        @Schema(description = "Parcela atual em aberto.", example = "1")
        Integer parcelaAtual,
        @Schema(description = "Quantidade total de parcelas.", example = "4")
        Integer totalParcelas
) {
}
