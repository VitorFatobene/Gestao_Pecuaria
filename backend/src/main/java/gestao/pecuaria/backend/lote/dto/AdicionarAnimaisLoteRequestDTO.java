package gestao.pecuaria.backend.lote.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Schema(description = "Animais que serao associados a um lote.")
public record AdicionarAnimaisLoteRequestDTO(
        @Schema(description = "IDs dos animais selecionados.", example = "[1, 2, 3]")
        @NotEmpty(message = "Informe ao menos um animal para associar ao lote.")
        List<@NotNull(message = "O ID do animal e obrigatorio.") Long> animalIds
) {
}
