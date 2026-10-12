package gestao.pecuaria.backend.venda.dto;

import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Schema(description = "Dados para registrar o recebimento do saldo pendente de uma venda.")
public record RegistrarRecebimentoVendaRequestDTO(
        @Schema(description = "Data efetiva do recebimento. Quando ausente, usa a data atual.", example = "2026-10-12")
        LocalDate dataPagamento,
        @Schema(description = "Forma de pagamento utilizada no recebimento.", example = "PIX")
        @NotNull
        FormaPagamento formaPagamento
) {
}
