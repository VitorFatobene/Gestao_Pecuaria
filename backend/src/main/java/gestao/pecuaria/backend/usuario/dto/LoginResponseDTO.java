package gestao.pecuaria.backend.usuario.dto;

import gestao.pecuaria.backend.usuario.Role;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resposta de autenticação com token JWT.")
public record LoginResponseDTO(
        @Schema(description = "Token JWT usado no header Authorization.", example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJpYUBmYXplbmRhLmNvbS5iciJ9.assinatura")
        String token,
        @Schema(description = "Tipo do token retornado.", example = "Bearer")
        String tipo,
        @Schema(description = "ID do usuário autenticado.", example = "1")
        Long usuarioId,
        @Schema(description = "Nome do usuário autenticado.", example = "Maria Oliveira")
        String nome,
        @Schema(description = "E-mail do usuário autenticado.", example = "maria@fazenda.com.br")
        String email,
        @Schema(description = "Perfil de acesso do usuário autenticado.", example = "USER")
        Role role
) {
}
