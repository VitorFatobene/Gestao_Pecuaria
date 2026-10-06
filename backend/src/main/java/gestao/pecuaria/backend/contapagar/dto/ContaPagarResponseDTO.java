package gestao.pecuaria.backend.contapagar.dto;

import gestao.pecuaria.backend.contapagar.enums.CategoriaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusContaPagar;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ContaPagarResponseDTO(
        Long id,
        String descricao,
        CategoriaContaPagar categoria,
        String fornecedor,
        BigDecimal valorTotal,
        BigDecimal valorPago,
        BigDecimal valorRestante,
        LocalDate dataCompra,
        TipoPagamentoContaPagar tipoPagamento,
        StatusContaPagar status,
        String observacao,
        Integer quantidadeParcelas,
        List<ParcelaContaPagarResponseDTO> parcelas,
        LocalDateTime criadoEm
) {
}
