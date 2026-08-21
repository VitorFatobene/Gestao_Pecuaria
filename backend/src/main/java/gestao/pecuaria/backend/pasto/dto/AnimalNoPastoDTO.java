package gestao.pecuaria.backend.pasto.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Animal atualmente presente em um pasto, com dados da movimentacao aberta.")
public record AnimalNoPastoDTO(
        @Schema(description = "ID interno do animal.", example = "10")
        Long animalId,
        @Schema(description = "Codigo de identificacao do animal.", example = "BRV1023")
        String codigoAnimal,
        @Schema(description = "Nome do animal.", example = "Imperador")
        String nome,
        @Schema(description = "Raca predominante do animal.", example = "Nelore")
        String raca,
        @Schema(description = "Peso do animal em quilogramas.", example = "520.00")
        BigDecimal pesoKg,
        @Schema(description = "Data de entrada no pasto atual.", example = "2026-08-20")
        LocalDate dataEntrada,
        @Schema(description = "Quantidade de dias no pasto atual.", example = "15")
        Integer diasNoPasto
) {
}
