package gestao.pecuaria.backend.movimentacao.dto;

import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Resumo do animal vinculado a uma movimentacao.")
public record AnimalResumoDTO(
        @Schema(description = "ID interno do animal.", example = "10")
        Long id,
        @Schema(description = "Codigo de identificacao do animal.", example = "1023")
        String codigoAnimal,
        @Schema(description = "Raca predominante do animal.", example = "Nelore")
        String raca,
        @Schema(description = "Peso do animal em quilogramas.", example = "520.00")
        BigDecimal pesoKg,
        @Schema(description = "Status operacional do animal.", example = "ATIVO")
        StatusAnimal status
) {
}
