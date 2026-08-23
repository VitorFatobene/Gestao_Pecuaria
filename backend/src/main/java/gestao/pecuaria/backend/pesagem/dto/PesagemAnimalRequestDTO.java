package gestao.pecuaria.backend.pesagem.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dados para registrar uma pesagem do animal.")
public record PesagemAnimalRequestDTO(
        @Schema(description = "Novo peso do animal em quilogramas.", example = "485.50")
        @NotNull(message = "O peso em kg é obrigatório")
        @Positive(message = "O peso deve ser maior que zero")
        BigDecimal pesoKg,

        @Schema(description = "Data da pesagem no formato ISO yyyy-MM-dd.", example = "2026-08-23")
        @NotNull(message = "A data da pesagem é obrigatória")
        LocalDate dataPesagem,

        @Schema(description = "Observação opcional da pesagem.", example = "Pesagem periódica")
        @Size(max = 500, message = "A observação deve ter no máximo 500 caracteres")
        String observacao
) {
}
