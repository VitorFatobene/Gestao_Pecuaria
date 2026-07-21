package gestao.pecuaria.backend.usuario.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Credenciais para autenticação no sistema.")
public record LoginRequestDTO(
        @Schema(description = "E-mail cadastrado do usuário.", example = "maria@fazenda.com.br")
        @NotBlank
        @Email
        String email,

        @Schema(description = "Senha cadastrada do usuário.", example = "senhaForte123")
        @NotBlank
        String senha
) {
}
