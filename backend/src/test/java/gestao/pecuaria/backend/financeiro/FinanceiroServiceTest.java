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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinanceiroServiceTest {

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private PastoRepository pastoRepository;

    @Mock
    private VendaRepository vendaRepository;

    @Mock
    private PagamentoVendaRepository pagamentoVendaRepository;

    @Mock
    private ParcelaContaPagarRepository parcelaContaPagarRepository;

    @InjectMocks
    private FinanceiroService financeiroService;

    @Test
    void deveGerarResumoFinanceiro() {
        when(animalRepository.somarTotalGasto()).thenReturn(new BigDecimal("1530.345"));
        when(vendaRepository.somarGanhoTotal()).thenReturn(new BigDecimal("2000.10"));
        when(pagamentoVendaRepository.somarPorStatus(StatusPagamento.PAGO)).thenReturn(new BigDecimal("1200.00"));
        when(pagamentoVendaRepository.somarAReceber()).thenReturn(new BigDecimal("800.00"));
        when(parcelaContaPagarRepository.somarPorStatus(StatusParcelaContaPagar.PAGA)).thenReturn(new BigDecimal("300.00"));
        when(parcelaContaPagarRepository.somarAPagar()).thenReturn(new BigDecimal("500.00"));
        when(parcelaContaPagarRepository.somarVencidas(LocalDate.now())).thenReturn(new BigDecimal("100.00"));
        when(animalRepository.count()).thenReturn(10L);
        when(animalRepository.countByStatus(StatusAnimal.ATIVO)).thenReturn(6L);
        when(animalRepository.countByStatus(StatusAnimal.VENDIDO)).thenReturn(3L);
        when(animalRepository.countByStatus(StatusAnimal.INATIVO)).thenReturn(1L);
        when(pastoRepository.count()).thenReturn(2L);
        when(vendaRepository.count()).thenReturn(3L);

        FinanceiroResumoDTO resumo = financeiroService.gerarResumo();

        assertThat(resumo.totalGasto()).isEqualByComparingTo("1530.35");
        assertThat(resumo.ganhoTotal()).isEqualByComparingTo("2000.10");
        assertThat(resumo.lucroTotal()).isEqualByComparingTo("469.75");
        assertThat(resumo.receitasRealizadas()).isEqualByComparingTo("1200.00");
        assertThat(resumo.receitasAReceber()).isEqualByComparingTo("800.00");
        assertThat(resumo.despesasRealizadas()).isEqualByComparingTo("300.00");
        assertThat(resumo.despesasAPagar()).isEqualByComparingTo("500.00");
        assertThat(resumo.despesasVencidas()).isEqualByComparingTo("100.00");
        assertThat(resumo.saldoRealizado()).isEqualByComparingTo("900.00");
        assertThat(resumo.saldoProjetado()).isEqualByComparingTo("1200.00");
        assertThat(resumo.totalAnimaisCadastrados()).isEqualTo(10);
        assertThat(resumo.totalAnimaisAtivos()).isEqualTo(6);
        assertThat(resumo.totalAnimaisVendidos()).isEqualTo(3);
        assertThat(resumo.totalAnimaisInativos()).isEqualTo(1);
        assertThat(resumo.totalPastosCadastrados()).isEqualTo(2);
        assertThat(resumo.totalVendasRealizadas()).isEqualTo(3);
    }

    @Test
    void deveAssumirZeroQuandoSomasRetornaremNull() {
        when(animalRepository.somarTotalGasto()).thenReturn(null);
        when(vendaRepository.somarGanhoTotal()).thenReturn(null);
        when(pagamentoVendaRepository.somarPorStatus(StatusPagamento.PAGO)).thenReturn(null);
        when(pagamentoVendaRepository.somarAReceber()).thenReturn(null);
        when(parcelaContaPagarRepository.somarPorStatus(StatusParcelaContaPagar.PAGA)).thenReturn(null);
        when(parcelaContaPagarRepository.somarAPagar()).thenReturn(null);
        when(parcelaContaPagarRepository.somarVencidas(LocalDate.now())).thenReturn(null);

        FinanceiroResumoDTO resumo = financeiroService.gerarResumo();

        assertThat(resumo.totalGasto()).isEqualByComparingTo("0.00");
        assertThat(resumo.ganhoTotal()).isEqualByComparingTo("0.00");
        assertThat(resumo.lucroTotal()).isEqualByComparingTo("0.00");
        assertThat(resumo.saldoRealizado()).isEqualByComparingTo("0.00");
        assertThat(resumo.saldoProjetado()).isEqualByComparingTo("0.00");
    }
}
