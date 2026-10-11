package gestao.pecuaria.backend.compra.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Dados retornados para uma compra de animais.")
public record CompraResponseDTO(
        @Schema(description = "ID da compra.", example = "1")
        Long id,
        @Schema(description = "Nome do fornecedor da compra.", example = "Fazenda Santa Luzia")
        String fornecedor,
        @Schema(description = "Data da compra.", example = "2026-10-06")
        LocalDate dataCompra,
        @Schema(description = "Valor total da compra.", example = "18000.00")
        BigDecimal valorTotal,
        @Schema(description = "Observações da compra.", example = "Negociação feita à vista.")
        String observacao,
        @Schema(description = "Quantidade de animais vinculados à compra.", example = "2")
        long quantidadeAnimais,
        @Schema(description = "Peso total dos animais vinculados à compra.", example = "840.00")
        BigDecimal pesoTotalKg,
        @Schema(description = "Valor médio por animal.", example = "9000.00")
        BigDecimal valorMedioAnimal,
        @Schema(description = "Animais vinculados à compra.")
        List<CompraAnimalResumoDTO> animais,
        @Schema(description = "Data e hora de criação do registro.", example = "2026-10-06T10:30:00")
        LocalDateTime criadoEm
) {
}
