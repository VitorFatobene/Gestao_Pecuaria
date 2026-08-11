package gestao.pecuaria.backend.lote.dto;

import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Resumo de animal associado a um lote.")
public record LoteAnimalResumoDTO(
        @Schema(description = "ID interno do animal.", example = "1")
        Long id,
        @Schema(description = "Codigo de identificacao do animal.", example = "1024")
        Long codigoAnimal,
        @Schema(description = "Raca predominante do animal.", example = "Nelore")
        String raca,
        @Schema(description = "Sexo do animal.", example = "MACHO")
        SexoAnimal sexo,
        @Schema(description = "Peso do animal em quilogramas.", example = "420.50")
        BigDecimal pesoKg,
        @Schema(description = "Status operacional do animal.", example = "ATIVO")
        StatusAnimal status
) {
}
