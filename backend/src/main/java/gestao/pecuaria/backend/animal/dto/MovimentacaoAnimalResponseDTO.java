package gestao.pecuaria.backend.animal.dto;

import gestao.pecuaria.backend.pasto.dto.PastoResumoDTO;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Registro de movimentacao do animal entre pastos.")
public record MovimentacaoAnimalResponseDTO(
        @Schema(description = "ID interno da movimentacao.", example = "1")
        Long id,
        @Schema(description = "Resumo do pasto da movimentacao.")
        PastoResumoDTO pasto,
        @Schema(description = "Data de entrada no pasto.", example = "2026-08-20")
        LocalDate dataEntrada,
        @Schema(description = "Data de saida do pasto. Nula quando a movimentacao e atual.", example = "2026-09-04")
        LocalDate dataSaida,
        @Schema(description = "Quantidade de dias de permanencia no pasto.", example = "15")
        Integer diasPermanencia,
        @Schema(description = "Indica se esta e a movimentacao atual.", example = "true")
        Boolean atual
) {
}
