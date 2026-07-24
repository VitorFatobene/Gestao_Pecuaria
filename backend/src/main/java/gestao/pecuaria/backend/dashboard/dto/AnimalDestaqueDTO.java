package gestao.pecuaria.backend.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Animal em destaque exibido no painel principal.")
public record AnimalDestaqueDTO(
        @Schema(description = "Identificador do animal.", example = "1")
        Long id,
        @Schema(description = "Código ou brinco do animal.", example = "1042")
        String codigoAnimal,
        @Schema(description = "Raça do animal.", example = "Nelore")
        String raca,
        @Schema(description = "Peso atual do animal em kg.", example = "452.50")
        BigDecimal pesoKg,
        @Schema(description = "Status atual do animal.", example = "ATIVO")
        String status,
        @Schema(description = "Nome do pasto onde o animal está alocado.", example = "Pasto 03")
        String pastoNome
) {
}
