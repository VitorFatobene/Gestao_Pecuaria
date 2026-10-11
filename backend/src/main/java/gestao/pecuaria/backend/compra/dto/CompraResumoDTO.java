package gestao.pecuaria.backend.compra.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Resumo da compra vinculada a um animal.")
public record CompraResumoDTO(
        @Schema(description = "ID da compra.", example = "1")
        Long id,
        @Schema(description = "Nome do fornecedor da compra.", example = "Fazenda Santa Luzia")
        String fornecedor,
        @Schema(description = "Data da compra.", example = "2026-10-06")
        LocalDate dataCompra,
        @Schema(description = "Valor total da compra.", example = "18000.00")
        BigDecimal valorTotal
) {
}
