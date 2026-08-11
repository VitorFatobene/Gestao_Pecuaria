package gestao.pecuaria.backend.lote.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para cadastro ou atualizacao de um lote.")
public record LoteRequestDTO(
        @Schema(description = "Nome do lote.", example = "Lote Nelore Setembro")
        @NotBlank(message = "O nome do lote e obrigatorio.")
        @Size(max = 120, message = "O nome do lote deve ter no maximo 120 caracteres.")
        String nome,

        @Schema(description = "Descricao opcional do lote.", example = "Animais separados para avaliacao comercial futura.")
        @Size(max = 500, message = "A descricao do lote deve ter no maximo 500 caracteres.")
        String descricao
) {
}
