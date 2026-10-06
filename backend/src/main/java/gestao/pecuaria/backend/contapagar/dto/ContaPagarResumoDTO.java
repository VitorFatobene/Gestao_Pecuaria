package gestao.pecuaria.backend.contapagar.dto;

import java.math.BigDecimal;

public record ContaPagarResumoDTO(
        BigDecimal totalAPagar,
        BigDecimal totalVencido,
        BigDecimal totalProximos7Dias,
        BigDecimal totalPagoMesAtual,
        Long quantidadeVencidas
) {
}
