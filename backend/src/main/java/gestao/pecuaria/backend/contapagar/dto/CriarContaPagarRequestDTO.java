package gestao.pecuaria.backend.contapagar.dto;

import gestao.pecuaria.backend.contapagar.enums.CategoriaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CriarContaPagarRequestDTO(
        @NotBlank @Size(max = 200) String descricao,
        @NotNull CategoriaContaPagar categoria,
        @NotBlank @Size(max = 200) String fornecedor,
        @NotNull @DecimalMin(value = "0.01") @Digits(integer = 10, fraction = 2) BigDecimal valorTotal,
        @NotNull LocalDate dataCompra,
        @NotNull TipoPagamentoContaPagar tipoPagamento,
        LocalDate dataVencimento,
        @Min(2) @Max(360) Integer quantidadeParcelas,
        LocalDate primeiroVencimento,
        @Positive @Max(3650) Integer intervaloDias,
        @Size(max = 1000) String observacao
) {
}
