package gestao.pecuaria.backend.venda.dto;

import java.math.BigDecimal;
import java.util.List;

public record VendaVisaoGeralDTO(
        long vendasMes,
        BigDecimal faturamento,
        BigDecimal ticketMedio,
        long animaisVendidos,
        List<FaturamentoMensalDTO> faturamentoMensal,
        List<AnimalFiltroDTO> animais
) {
    public record FaturamentoMensalDTO(String mes, BigDecimal faturamento) {
    }

    public record AnimalFiltroDTO(Long id, Long codigoAnimal, String raca) {
    }
}
