package gestao.pecuaria.backend.pasto.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Resumo dos animais alocados no pasto por categoria disponível no cadastro.")
public record PastoAnimaisResumoDTO(
        @Schema(description = "Categoria dos animais. Atualmente calculada pelo sexo cadastrado.", example = "Macho")
        String categoria,
        @Schema(description = "Quantidade de animais na categoria.", example = "12")
        Long quantidade,
        @Schema(description = "Peso médio dos animais da categoria em kg.", example = "420.50")
        BigDecimal pesoMedio,
        @Schema(description = "Idade média dos animais. Retorna não informada enquanto o cadastro não possui data de nascimento.", example = "Não informada")
        String idadeMedia
) {
}
