package gestao.pecuaria.backend.cotacao.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Cotação atual do boi gordo para a UF configurada.")
public record CotacaoBoiResponseDTO(
        @Schema(description = "Valor da arroba retornado para a UF configurada.", example = "355.00")
        BigDecimal valorArroba,
        @Schema(description = "UF da cotação.", example = "PR")
        String uf,
        @Schema(description = "Praça da cotação.", example = "PR")
        String praca,
        @Schema(description = "Data e hora de atualização da cotação.", example = "2026-08-06T13:05:40")
        LocalDateTime atualizado
) {
}
