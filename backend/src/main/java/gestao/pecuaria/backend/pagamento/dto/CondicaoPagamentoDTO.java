package gestao.pecuaria.backend.pagamento.dto;

import gestao.pecuaria.backend.pagamento.enums.TipoPagamento;

import java.math.BigDecimal;

public record CondicaoPagamentoDTO(
        TipoPagamento tipoPagamento,
        BigDecimal entrada,
        Integer quantidadeParcelas,
        Integer intervaloDias,
        Integer diasCarencia
) {
}
