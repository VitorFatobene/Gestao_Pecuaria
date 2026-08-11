package gestao.pecuaria.backend.lote.dto;

import gestao.pecuaria.backend.lote.enums.StatusLote;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Dados retornados para um lote cadastrado.")
public record LoteResponseDTO(
        @Schema(description = "ID interno do lote.", example = "1")
        Long id,
        @Schema(description = "Nome do lote.", example = "Lote Nelore Setembro")
        String nome,
        @Schema(description = "Descricao do lote.", example = "Animais separados para avaliacao comercial futura.")
        String descricao,
        @Schema(description = "Status operacional do lote.", example = "ABERTO")
        StatusLote status,
        @Schema(description = "Quantidade de animais associados ao lote.", example = "0")
        Long quantidadeAnimais,
        @Schema(description = "Data e hora de criacao do registro.", example = "2026-08-11T09:30:00")
        LocalDateTime criadoEm
) {
}
