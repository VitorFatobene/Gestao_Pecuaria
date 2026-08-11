package gestao.pecuaria.backend.venda.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dados para registrar a venda de um lote.")
public record VendaRequestDTO(
        @Schema(description = "ID do lote que será vendido.", example = "1")
        @NotNull
        Long loteId,

        @Schema(description = "Nome do comprador.", example = "Frigorífico Boa Carne")
        @NotBlank
        String nomeComprador,

        @Schema(description = "Valor total da venda.", example = "5200.00")
        @NotNull
        @Positive
        BigDecimal valorTotal,

        @Schema(description = "Data da venda no formato ISO yyyy-MM-dd.", example = "2026-03-20")
        @NotNull
        LocalDate dataVenda,

        @Schema(description = "Peso do animal em quilogramas no momento da venda.", example = "465.80")
        @NotNull
        @Positive
        BigDecimal pesoKgVenda
) {
}
