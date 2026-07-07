package gestao.pecuaria.backend.pasto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record PastoRequestDTO(
        @NotBlank
        String nome,

        @NotNull
        @Positive
        BigDecimal areaHectares,

        String descricao,

        Boolean ativo
) {
}
