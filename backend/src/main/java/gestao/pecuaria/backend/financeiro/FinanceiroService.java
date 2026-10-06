package gestao.pecuaria.backend.financeiro;

import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar;
import gestao.pecuaria.backend.contapagar.repository.ParcelaContaPagarRepository;
import gestao.pecuaria.backend.financeiro.dto.FinanceiroResumoDTO;
import gestao.pecuaria.backend.pagamento.enums.StatusPagamento;
import gestao.pecuaria.backend.pagamento.repository.PagamentoVendaRepository;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.venda.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class FinanceiroService {

    private final AnimalRepository animalRepository;
    private final PastoRepository pastoRepository;
    private final VendaRepository vendaRepository;
    private final PagamentoVendaRepository pagamentoVendaRepository;
    private final ParcelaContaPagarRepository parcelaContaPagarRepository;

    @Transactional(readOnly = true)
    public FinanceiroResumoDTO gerarResumo() {
        BigDecimal totalGasto = formatarValor(animalRepository.somarTotalGasto());
        BigDecimal ganhoTotal = formatarValor(vendaRepository.somarGanhoTotal());
        BigDecimal lucroTotal = formatarValor(ganhoTotal.subtract(totalGasto));
        BigDecimal receitasRealizadas = formatarValor(pagamentoVendaRepository.somarPorStatus(StatusPagamento.PAGO));
        BigDecimal receitasAReceber = formatarValor(pagamentoVendaRepository.somarAReceber());
        BigDecimal despesasRealizadas = formatarValor(parcelaContaPagarRepository.somarPorStatus(StatusParcelaContaPagar.PAGA));
        BigDecimal despesasAPagar = formatarValor(parcelaContaPagarRepository.somarAPagar());
        BigDecimal despesasVencidas = formatarValor(parcelaContaPagarRepository.somarVencidas(LocalDate.now()));
        BigDecimal saldoRealizado = formatarValor(receitasRealizadas.subtract(despesasRealizadas));
        BigDecimal saldoProjetado = formatarValor(receitasRealizadas.add(receitasAReceber)
                .subtract(despesasRealizadas.add(despesasAPagar)));

        return new FinanceiroResumoDTO(
                totalGasto,
                ganhoTotal,
                lucroTotal,
                receitasRealizadas,
                receitasAReceber,
                despesasRealizadas,
                despesasAPagar,
                despesasVencidas,
                saldoRealizado,
                saldoProjetado,
                toInteger(animalRepository.count()),
                toInteger(animalRepository.countByStatus(StatusAnimal.ATIVO)),
                toInteger(animalRepository.countByStatus(StatusAnimal.VENDIDO)),
                toInteger(animalRepository.countByStatus(StatusAnimal.INATIVO)),
                toInteger(pastoRepository.count()),
                toInteger(vendaRepository.count())
        );
    }

    private BigDecimal formatarValor(BigDecimal valor) {
        return (valor != null ? valor : BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private Integer toInteger(long valor) {
        return Math.toIntExact(valor);
    }
}
