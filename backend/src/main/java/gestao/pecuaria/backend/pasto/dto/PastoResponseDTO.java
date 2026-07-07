package gestao.pecuaria.backend.pasto.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PastoResponseDTO(
        Long id,
        String nome,
        BigDecimal areaHectares,
        String descricao,
        Boolean ativo,
        LocalDateTime criadoEm
) {
}
