package gestao.pecuaria.backend.venda.dto;

import gestao.pecuaria.backend.pagamento.dto.CondicaoPagamentoDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dados para realizar a venda completa de um lote.")
public record VendaLoteRequestDTO(
        @Schema(description = "ID do lote que será vendido.", example = "1")
        @NotNull
        Long loteId,

        @Schema(description = "Nome do comprador.", example = "Frigorífico Boa Carne")
        @NotBlank
        String comprador,

        @Schema(description = "Valor total da venda.", example = "100000.00")
        @NotNull
        @Positive
        BigDecimal valorTotal,

        @Schema(description = "Data da venda no formato ISO yyyy-MM-dd.", example = "2026-08-11")
        @NotNull
        LocalDate dataVenda,

        @Schema(description = "Condição financeira da venda.")
        @NotNull
        @Valid
        CondicaoPagamentoDTO condicaoPagamento
) {
}
