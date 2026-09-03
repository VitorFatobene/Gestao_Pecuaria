package gestao.pecuaria.backend.usuario.dto;

import gestao.pecuaria.backend.usuario.Role;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados públicos do perfil do usuário autenticado.")
public record PerfilUsuarioResponseDTO(
        @Schema(description = "ID interno do usuário.", example = "1")
        Long id,
        @Schema(description = "Nome do usuário.", example = "Vitor")
        String nome,
        @Schema(description = "E-mail usado para login.", example = "vitor@email.com")
        String email,
        @Schema(description = "Nome da fazenda ou propriedade rural.", example = "Estância Dona Rose")
        String nomeFazenda,
        @Schema(description = "Perfil de acesso do usuário.", example = "USER")
        Role role
) {
}
