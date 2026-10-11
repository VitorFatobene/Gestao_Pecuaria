package gestao.pecuaria.backend.compra.dto;

import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

@Schema(description = "Dados de um animal incluído em uma compra.")
public record CompraAnimalRequestDTO(
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

        @Schema(description = "URL opcional de imagem do animal.", example = "https://cdn.fazenda.com.br/animais/1024.jpg")
        String imagemUrl,

        @Schema(description = "ID opcional do pasto onde o animal será alocado.", example = "1")
        Long pastoId,

        @Schema(description = "Custo do animal quando o rateio da compra for manual.", example = "3850.00")
        @PositiveOrZero(message = "O valor pago não pode ser negativo")
        BigDecimal valorPago
) {
}
