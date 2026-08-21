package gestao.pecuaria.backend.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Indicadores de manejo e rotacao de pastagens.")
public record DashboardManejoDTO(
        @Schema(description = "Quantidade de pastos ativos.", example = "6")
        Integer pastosAtivos,
        @Schema(description = "Quantidade de animais atualmente em pastos.", example = "42")
        Integer animaisEmPastos,
        @Schema(description = "Tempo medio de permanencia atual em dias.", example = "24")
        Integer tempoMedioPermanencia,
        @Schema(description = "Cinco animais com maior permanencia no pasto atual.")
        List<AnimalPermanenciaDTO> animaisMaiorPermanencia,
        @Schema(description = "Indicadores de rotacao por pasto ativo.")
        List<PastoRotacaoDTO> pastosRotacao
) {
}
