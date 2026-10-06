package gestao.pecuaria.backend.animal.dto;

import gestao.pecuaria.backend.contapagar.enums.StatusContaPagar;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CompraAnimalContaPagarDTO(
        Long contaPagarId,
        BigDecimal valorTotal,
        TipoPagamentoContaPagar tipoPagamento,
        StatusContaPagar status,
        LocalDate proximoVencimento
) {
}
