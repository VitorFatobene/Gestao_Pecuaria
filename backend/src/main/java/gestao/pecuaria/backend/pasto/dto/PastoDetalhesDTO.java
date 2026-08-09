package gestao.pecuaria.backend.pasto.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Detalhes operacionais de um pasto.")
public record PastoDetalhesDTO(
        @Schema(description = "Resumo do pasto.")
        PastoResumoDTO pasto,
        @Schema(description = "Resumo dos animais ativos alocados no pasto.")
        List<PastoAnimaisResumoDTO> animaisAlocados
) {
}
