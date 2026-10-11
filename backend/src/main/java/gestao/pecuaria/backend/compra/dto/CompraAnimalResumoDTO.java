package gestao.pecuaria.backend.compra.dto;

import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Resumo de animal vinculado a uma compra.")
public record CompraAnimalResumoDTO(
        @Schema(description = "ID do animal.", example = "1")
        Long id,
        @Schema(description = "Código de identificação do animal.", example = "1024")
        Long codigoAnimal,
        @Schema(description = "Raça predominante do animal.", example = "Nelore")
        String raca,
        @Schema(description = "Peso do animal em quilogramas.", example = "420.50")
        BigDecimal pesoKg,
        @Schema(description = "Custo atribuído ao animal no rateio da compra.", example = "3850.00")
        BigDecimal valorPago,
        @Schema(description = "Status operacional do animal.", example = "ATIVO")
        StatusAnimal status
) {
}
