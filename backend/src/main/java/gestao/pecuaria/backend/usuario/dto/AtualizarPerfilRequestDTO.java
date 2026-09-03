package gestao.pecuaria.backend.usuario.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para atualização do perfil do usuário autenticado.")
public record AtualizarPerfilRequestDTO(
        @Schema(description = "Nome do usuário.", example = "Vitor")
        @NotBlank
        @Size(max = 150)
        String nome,

        @Schema(description = "Nome da fazenda ou propriedade rural.", example = "Estância Dona Rose")
        @NotBlank
        @Size(max = 150)
        String nomeFazenda,

        @Schema(description = "Senha atual, obrigatória quando uma nova senha é informada.", example = "senhaAtual123")
        String senhaAtual,

        @Schema(description = "Nova senha, com no mínimo 6 caracteres quando informada.", example = "novaSenha123")
        String novaSenha,

        @Schema(description = "Confirmação da nova senha.", example = "novaSenha123")
        String confirmacaoNovaSenha
) {
}
