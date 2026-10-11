package gestao.pecuaria.backend.contapagar.dto;

import gestao.pecuaria.backend.animal.enums.StatusAnimal;

import java.math.BigDecimal;

public record ContaPagarCompraAnimalDTO(
        Long id,
        Long codigoAnimal,
        String raca,
        BigDecimal pesoKg,
        BigDecimal valorPago,
        StatusAnimal status
) {
}
