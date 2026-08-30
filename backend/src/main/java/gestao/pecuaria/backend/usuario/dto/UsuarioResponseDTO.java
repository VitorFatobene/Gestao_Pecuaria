package gestao.pecuaria.backend.usuario.dto;

import gestao.pecuaria.backend.usuario.Role;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Dados públicos retornados para um usuário.")
public record UsuarioResponseDTO(
        @Schema(description = "ID interno do usuário.", example = "1")
        Long id,
        @Schema(description = "Nome do usuário.", example = "Maria")
        String nome,
        @Schema(description = "Sobrenome do usuário.", example = "Oliveira")
        String sobrenome,
        @Schema(description = "Telefone de contato do usuário.", example = "(11) 99999-9999")
        String telefone,
        @Schema(description = "Cidade do usuário.", example = "Ribeirão Preto")
        String cidade,
        @Schema(description = "Estado do usuário.", example = "SP")
        String estado,
        @Schema(description = "E-mail usado para login.", example = "maria@fazenda.com.br")
        String email,
        @Schema(description = "Nome da propriedade rural.", example = "Fazenda Boa Vista")
        String nomePropriedadeRural,
        @Schema(description = "Perfil de acesso do usuário.", example = "USER")
        Role role,
        @Schema(description = "Data e hora de criação do usuário.", example = "2026-01-05T09:00:00")
        LocalDateTime criadoEm
) {
}
