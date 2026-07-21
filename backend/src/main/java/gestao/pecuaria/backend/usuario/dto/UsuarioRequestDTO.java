package gestao.pecuaria.backend.usuario.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para cadastro ou atualização de usuário.")
public record UsuarioRequestDTO(
        @Schema(description = "Nome completo do usuário.", example = "Maria Oliveira")
        @NotBlank
        String nome,

        @Schema(description = "E-mail usado para login.", example = "maria@fazenda.com.br")
        @NotBlank
        @Email
        String email,

        @Schema(description = "Senha do usuário, com no mínimo 6 caracteres.", example = "senhaForte123")
        @NotBlank
        @Size(min = 6)
        String senha
) {
}
