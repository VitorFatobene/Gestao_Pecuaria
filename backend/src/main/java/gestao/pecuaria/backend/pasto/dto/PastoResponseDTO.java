package gestao.pecuaria.backend.pasto.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Dados retornados para um pasto cadastrado.")
public record PastoResponseDTO(
        @Schema(description = "ID interno do pasto.", example = "1")
        Long id,
        @Schema(description = "Nome do pasto.", example = "Pasto Maternidade")
        String nome,
        @Schema(description = "Área do pasto em hectares.", example = "18.50")
        BigDecimal areaHectares,
        @Schema(description = "Descrição do pasto.", example = "Área com bebedouro central e sombra natural.")
        String descricao,
        @Schema(description = "Indica se o pasto está ativo.", example = "true")
        Boolean ativo,
        @Schema(description = "Data e hora de criação do registro.", example = "2026-01-10T08:15:00")
        LocalDateTime criadoEm
) {
}
