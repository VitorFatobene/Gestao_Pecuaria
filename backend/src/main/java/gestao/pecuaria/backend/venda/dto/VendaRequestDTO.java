package gestao.pecuaria.backend.venda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record VendaRequestDTO(
        @NotNull
        Long animalId,

        @NotBlank
        String nomeComprador,

        @NotNull
        @Positive
        BigDecimal valorVenda,

        @NotNull
        LocalDate dataVenda,

        @NotNull
        @Positive
        BigDecimal pesoKgVenda
) {
}
