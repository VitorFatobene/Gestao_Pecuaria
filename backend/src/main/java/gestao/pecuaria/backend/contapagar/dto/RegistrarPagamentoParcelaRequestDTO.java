package gestao.pecuaria.backend.contapagar.dto;

import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record RegistrarPagamentoParcelaRequestDTO(
        @NotNull LocalDate dataPagamento,
        @NotNull FormaPagamento formaPagamento
) {
}
