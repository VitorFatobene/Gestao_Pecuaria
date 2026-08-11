package gestao.pecuaria.backend.venda.dto;

import gestao.pecuaria.backend.lote.enums.StatusLote;
import gestao.pecuaria.backend.pagamento.dto.PagamentoVendaResponseDTO;
import gestao.pecuaria.backend.venda.enums.StatusVenda;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Dados retornados para uma venda registrada.")
public record VendaResponseDTO(
        @Schema(description = "ID interno da venda.", example = "1")
        Long id,
        @Schema(description = "ID do lote vendido.", example = "1")
        Long loteId,
        @Schema(description = "Nome do lote vendido.", example = "Lote Nelore Setembro")
        String nomeLote,
        @Schema(description = "Status operacional do lote.", example = "ABERTO")
        StatusLote statusLote,
        @Schema(description = "Quantidade de animais associados ao lote.", example = "12")
        Long quantidadeAnimaisLote,
        @Schema(description = "Peso total dos animais associados ao lote em quilogramas.", example = "5589.60")
        BigDecimal pesoTotalKgLote,
        @Schema(description = "Nome do comprador.", example = "Frigorífico Boa Carne")
        String nomeComprador,
        @Schema(description = "Valor total da venda.", example = "5200.00")
        BigDecimal valorTotal,
        @Schema(description = "Data da venda.", example = "2026-03-20")
        LocalDate dataVenda,
        @Schema(description = "Peso do lote em quilogramas no momento da venda.", example = "5589.60")
        BigDecimal pesoKgVenda,
        @Schema(description = "Peso do lote convertido para arrobas no momento da venda.", example = "186.32")
        BigDecimal pesoArrobaVenda,
        @Schema(description = "Status comercial da venda.", example = "PAGA")
        StatusVenda status,
        @Schema(description = "Pagamentos gerados para a venda.")
        List<PagamentoVendaResponseDTO> pagamentos,
        @Schema(description = "Data e hora de criação do registro.", example = "2026-03-20T14:45:00")
        LocalDateTime criadoEm
) {
}
