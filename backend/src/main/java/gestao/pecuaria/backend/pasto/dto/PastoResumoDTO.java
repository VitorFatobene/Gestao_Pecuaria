package gestao.pecuaria.backend.pasto.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Resumo operacional de um pasto para a tela de gestão.")
public record PastoResumoDTO(
        @Schema(description = "ID interno do pasto.", example = "1")
        Long id,
        @Schema(description = "Nome do pasto.", example = "Pasto Boa Vista 01")
        String nome,
        @Schema(description = "Área do pasto em hectares.", example = "42.50")
        BigDecimal areaHectares,
        @Schema(description = "Capacidade calculada de animais para a área do pasto.", example = "80")
        Integer capacidade,
        @Schema(description = "Quantidade real de animais ativos alocados no pasto.", example = "46")
        Long quantidadeAnimais,
        @Schema(description = "Taxa de ocupação calculada.", example = "57.50")
        BigDecimal ocupacaoPercentual,
        @Schema(description = "Status de ocupação calculado.", example = "NORMAL")
        String statusOcupacao,
        @Schema(description = "Tipo de pastagem. Retorna não cadastrado enquanto o modelo não possui esse campo.", example = "Não cadastrado")
        String tipoPastagem,
        @Schema(description = "Descrição/observações do pasto.")
        String descricao,
        @Schema(description = "Indica se o pasto está ativo.", example = "true")
        Boolean ativo,
        @Schema(description = "Data e hora de criação do registro.")
        LocalDateTime criadoEm
) {
}
