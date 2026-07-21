package gestao.pecuaria.backend.usuario.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Dados públicos retornados para um usuário.")
public record UsuarioResponseDTO(
        @Schema(description = "ID interno do usuário.", example = "1")
        Long id,
        @Schema(description = "Nome completo do usuário.", example = "Maria Oliveira")
        String nome,
        @Schema(description = "E-mail usado para login.", example = "maria@fazenda.com.br")
        String email,
        @Schema(description = "Data e hora de criação do usuário.", example = "2026-01-05T09:00:00")
        LocalDateTime criadoEm
) {
}
