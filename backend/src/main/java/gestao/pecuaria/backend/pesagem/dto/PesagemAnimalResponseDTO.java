package gestao.pecuaria.backend.pesagem.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dados retornados para uma pesagem do animal.")
public record PesagemAnimalResponseDTO(
        @Schema(description = "ID interno da pesagem.", example = "1")
        Long id,
        @Schema(description = "Peso registrado em quilogramas.", example = "485.50")
        BigDecimal pesoKg,
        @Schema(description = "Data da pesagem.", example = "2026-08-23")
        LocalDate dataPesagem,
        @Schema(description = "Observação da pesagem.", example = "Pesagem periódica")
        String observacao
) {
}
