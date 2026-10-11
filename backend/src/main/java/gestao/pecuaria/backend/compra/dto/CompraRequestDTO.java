package gestao.pecuaria.backend.compra.dto;

import gestao.pecuaria.backend.compra.enums.TipoRateioCompra;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;
import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Dados para cadastro de uma compra de animais.")
public record CompraRequestDTO(
        @Schema(description = "Nome do fornecedor da compra.", example = "Fazenda Santa Luzia")
        @NotBlank(message = "O fornecedor é obrigatório")
        @Size(max = 200, message = "O fornecedor deve ter no máximo 200 caracteres")
        String fornecedor,

        @Schema(description = "Data da compra no formato ISO yyyy-MM-dd.", example = "2026-10-06")
        @NotNull(message = "A data da compra é obrigatória")
        LocalDate dataCompra,

        @Schema(description = "Valor total da compra.", example = "18000.00")
        @NotNull(message = "O valor total é obrigatório")
        @Positive(message = "O valor total deve ser maior que zero")
        BigDecimal valorTotal,

        @Schema(description = "Observações opcionais da compra.", example = "Negociação feita à vista.")
        @Size(max = 1000, message = "A observação deve ter no máximo 1000 caracteres")
        String observacao,

        @Schema(description = "Tipo de rateio do valor total entre os animais.", example = "PROPORCIONAL_PESO")
        @NotNull(message = "O tipo de rateio é obrigatório")
        TipoRateioCompra tipoRateio,

        @Schema(description = "Forma de pagamento da obrigação financeira.", example = "A_VISTA")
        @NotNull(message = "O tipo de pagamento é obrigatório")
        TipoPagamentoContaPagar tipoPagamento,

        @Schema(description = "Indica se a compra à vista foi paga no ato.", example = "false")
        Boolean pagamentoRealizadoNoAto,

        @Schema(description = "Data de pagamento quando a compra à vista foi paga no ato.", example = "2026-10-06")
        LocalDate dataPagamento,

        @Schema(description = "Forma de pagamento quando a compra à vista foi paga no ato.", example = "PIX")
        FormaPagamento formaPagamento,

        @Schema(description = "Data de vencimento para pagamento a prazo.", example = "2026-11-06")
        LocalDate dataVencimento,

        @Schema(description = "Quantidade de parcelas para pagamento parcelado.", example = "3")
        Integer quantidadeParcelas,

        @Schema(description = "Primeiro vencimento para pagamento parcelado.", example = "2026-11-06")
        LocalDate primeiroVencimento,

        @Schema(description = "Intervalo em dias entre parcelas.", example = "30")
        Integer intervaloDias,

        @Schema(description = "Animais incluídos na compra.")
        @NotEmpty(message = "A compra deve possuir ao menos um animal")
        List<@Valid CompraAnimalRequestDTO> animais
) {
}
