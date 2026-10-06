package gestao.pecuaria.backend.contapagar.dto;

import gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar;
import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ParcelaContaPagarResponseDTO(
        Long id,
        Integer numeroParcela,
        BigDecimal valor,
        LocalDate dataVencimento,
        LocalDate dataPagamento,
        StatusParcelaContaPagar status,
        FormaPagamento formaPagamento,
        Long diasParaVencimento,
        boolean atrasada
) {
}
