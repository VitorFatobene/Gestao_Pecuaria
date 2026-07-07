package gestao.pecuaria.backend.animal.dto;

import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AnimalRequestDTO(

        @NotNull(message = "O código do animal é obrigatório")
        Long codigoAnimal,

        @NotBlank(message = "A raça é obrigatória")
        String raca,

        @NotNull(message = "O sexo do animal é obrigatório")
        SexoAnimal sexo,

        @NotNull(message = "O peso em kg é obrigatório")
        @Positive(message = "O peso deve ser maior que zero")
        BigDecimal pesoKg,

        @NotNull(message = "O valor pago é obrigatório")
        @PositiveOrZero(message = "O valor pago não pode ser negativo")
        BigDecimal valorPago,

        @NotNull
        @PositiveOrZero(message = "Caso não haja frete, informe 0")
        BigDecimal valorFrete,

        @NotBlank(message = "O nome do vendedor é obrigatório")
        String nomeVendedor,

        @NotNull(message = "A data da compra é obrigatória")
        LocalDate dataCompra,

        String imagemUrl,

        Long pastoId
) {
}
