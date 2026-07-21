package gestao.pecuaria.backend.animal.dto;

import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dados para cadastro ou atualização de um animal.")
public record AnimalRequestDTO(

        @Schema(description = "Código de identificação do animal na propriedade.", example = "1024")
        @NotNull(message = "O código do animal é obrigatório")
        Long codigoAnimal,

        @Schema(description = "Raça predominante do animal.", example = "Nelore")
        @NotBlank(message = "A raça é obrigatória")
        String raca,

        @Schema(description = "Sexo do animal.", example = "MACHO", allowableValues = {"MACHO", "FEMEA"})
        @NotNull(message = "O sexo do animal é obrigatório")
        SexoAnimal sexo,

        @Schema(description = "Peso atual do animal em quilogramas.", example = "420.50")
        @NotNull(message = "O peso em kg é obrigatório")
        @Positive(message = "O peso deve ser maior que zero")
        BigDecimal pesoKg,

        @Schema(description = "Valor pago na compra do animal.", example = "3850.00")
        @NotNull(message = "O valor pago é obrigatório")
        @PositiveOrZero(message = "O valor pago não pode ser negativo")
        BigDecimal valorPago,

        @Schema(description = "Valor do frete pago na compra. Informe zero quando não houver frete.", example = "150.00")
        @NotNull
        @PositiveOrZero(message = "Caso não haja frete, informe 0")
        BigDecimal valorFrete,

        @Schema(description = "Nome do vendedor do animal.", example = "Fazenda Santa Luzia")
        @NotBlank(message = "O nome do vendedor é obrigatório")
        String nomeVendedor,

        @Schema(description = "Data da compra no formato ISO yyyy-MM-dd.", example = "2026-02-15")
        @NotNull(message = "A data da compra é obrigatória")
        LocalDate dataCompra,

        @Schema(description = "URL opcional de imagem do animal.", example = "https://cdn.fazenda.com.br/animais/1024.jpg")
        String imagemUrl,

        @Schema(description = "ID opcional do pasto onde o animal será alocado.", example = "1")
        Long pastoId
) {
}
