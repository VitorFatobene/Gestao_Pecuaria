package gestao.pecuaria.backend.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Indicador de rotacao de um pasto.")
public record PastoRotacaoDTO(
        @Schema(description = "Nome do pasto.", example = "Pasto Boa Vista 01")
        String nome,
        @Schema(description = "Quantidade atual de animais no pasto.", example = "18")
        Integer quantidadeAnimais,
        @Schema(description = "Maior tempo de ocupacao atual entre os animais do pasto.", example = "42")
        Integer diasOcupacao,
        @Schema(description = "Status de rotacao do pasto.", example = "ATENCAO")
        String status
) {
}
