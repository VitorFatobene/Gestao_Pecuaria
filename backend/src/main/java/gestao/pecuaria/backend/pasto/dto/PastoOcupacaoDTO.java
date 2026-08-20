package gestao.pecuaria.backend.pasto.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Indicadores de ocupacao atual e permanencia dos animais no pasto.")
public record PastoOcupacaoDTO(
        @Schema(description = "ID interno do pasto.", example = "1")
        Long pastoId,
        @Schema(description = "Quantidade atual de animais no pasto.", example = "50")
        Integer quantidadeAnimais,
        @Schema(description = "Tempo medio de permanencia dos animais no pasto, em dias.", example = "18")
        Integer tempoMedioPermanencia,
        @Schema(description = "Maior tempo de permanencia entre os animais do pasto, em dias.", example = "38")
        Integer maiorTempoPermanencia
) {
}
