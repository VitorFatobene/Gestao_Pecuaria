package gestao.pecuaria.backend.pagamento.dto;

import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import gestao.pecuaria.backend.pagamento.enums.StatusPagamento;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Pagamento gerado para uma venda.")
public record PagamentoVendaResponseDTO(
        @Schema(description = "ID interno do pagamento.", example = "1")
        Long id,
        @Schema(description = "Número sequencial da parcela.", example = "1")
        Integer numeroParcela,
        @Schema(description = "Valor da parcela.", example = "20000.00")
        BigDecimal valor,
        @Schema(description = "Data de vencimento da parcela.", example = "2026-09-10")
        LocalDate dataVencimento,
        @Schema(description = "Data em que o pagamento foi realizado.", example = "2026-08-11")
        LocalDate dataPagamento,
        @Schema(description = "Status do pagamento.", example = "PENDENTE")
        StatusPagamento status,
        @Schema(description = "Forma de pagamento.", example = "PIX")
        FormaPagamento formaPagamento
) {
}
