package gestao.pecuaria.backend.pasto.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

@Schema(description = "Dados para cadastro ou atualização de um pasto.")
public record PastoRequestDTO(
        @Schema(description = "Nome do pasto.", example = "Pasto Maternidade")
        @NotBlank
        String nome,

        @Schema(description = "Área do pasto em hectares.", example = "18.50")
        @NotNull
        @Positive
        BigDecimal areaHectares,

        @Schema(description = "Descrição opcional do pasto.", example = "Área com bebedouro central e sombra natural.")
        String descricao,

        @Schema(description = "Indica se o pasto está ativo para uso.", example = "true")
        Boolean ativo
) {
}
