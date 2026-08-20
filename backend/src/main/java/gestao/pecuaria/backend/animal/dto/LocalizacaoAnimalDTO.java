package gestao.pecuaria.backend.animal.dto;

import gestao.pecuaria.backend.pasto.dto.PastoResumoDTO;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Localizacao atual do animal no pasto.")
public record LocalizacaoAnimalDTO(
        @Schema(description = "ID interno do animal.", example = "10")
        Long animalId,
        @Schema(description = "Resumo do pasto atual do animal.")
        PastoResumoDTO pasto,
        @Schema(description = "Data de entrada no pasto atual.", example = "2026-08-20")
        LocalDate dataEntrada,
        @Schema(description = "Quantidade de dias desde a entrada no pasto atual.", example = "15")
        Integer diasPermanencia
) {
}
