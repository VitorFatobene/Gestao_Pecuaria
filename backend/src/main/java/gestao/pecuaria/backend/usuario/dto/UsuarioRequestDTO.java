package gestao.pecuaria.backend.usuario.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para cadastro ou atualização de usuário.")
public record UsuarioRequestDTO(
        @Schema(description = "Nome do usuário.", example = "Maria")
        @NotBlank
        String nome,

        @Schema(description = "Sobrenome do usuário.", example = "Oliveira")
        @NotBlank
        String sobrenome,

        @Schema(description = "Telefone de contato do usuário.", example = "(11) 99999-9999")
        @NotBlank
        String telefone,

        @Schema(description = "Cidade do usuário.", example = "Ribeirão Preto")
        @NotBlank
        String cidade,

        @Schema(description = "Estado do usuário.", example = "SP")
        @NotBlank
        @Size(min = 2, max = 2)
        String estado,

        @Schema(description = "E-mail usado para login.", example = "maria@fazenda.com.br")
        @NotBlank
        @Email
        String email,

        @Schema(description = "Senha do usuário, com no mínimo 6 caracteres.", example = "senhaForte123")
        @NotBlank
        @Size(min = 6)
        String senha,

        @Schema(description = "Nome da propriedade rural.", example = "Fazenda Boa Vista")
        @NotBlank
        String nomePropriedadeRural
) {
}
