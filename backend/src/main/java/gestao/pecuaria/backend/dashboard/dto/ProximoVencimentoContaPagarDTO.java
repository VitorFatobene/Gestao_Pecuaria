package gestao.pecuaria.backend.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProximoVencimentoContaPagarDTO(
        Long contaPagarId,
        String descricao,
        LocalDate dataVencimento,
        BigDecimal valor
) {
}
