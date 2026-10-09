package gestao.pecuaria.backend.financeiro;

import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar;
import gestao.pecuaria.backend.contapagar.repository.ParcelaContaPagarRepository;
import gestao.pecuaria.backend.financeiro.dto.FinanceiroResumoDTO;
import gestao.pecuaria.backend.pagamento.enums.StatusPagamento;
import gestao.pecuaria.backend.pagamento.repository.PagamentoVendaRepository;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.usuario.UsuarioAutenticadoService;
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

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private FinanceiroService financeiroService;

    @Test
    void deveGerarResumoFinanceiro() {
        when(usuarioAutenticadoService.getUsuarioAutenticadoId()).thenReturn(1L);
        when(animalRepository.somarTotalGastoPorUsuario(1L)).thenReturn(new BigDecimal("1530.345"));
        when(vendaRepository.somarGanhoTotalPorUsuario(1L)).thenReturn(new BigDecimal("2000.10"));
        when(pagamentoVendaRepository.somarPorStatusAndUsuarioId(StatusPagamento.PAGO, 1L)).thenReturn(new BigDecimal("1200.00"));
        when(pagamentoVendaRepository.somarAReceberPorUsuario(1L)).thenReturn(new BigDecimal("800.00"));
        when(parcelaContaPagarRepository.somarPorStatusAndUsuarioId(StatusParcelaContaPagar.PAGA, 1L)).thenReturn(new BigDecimal("300.00"));
        when(parcelaContaPagarRepository.somarAPagarPorUsuario(1L)).thenReturn(new BigDecimal("500.00"));
        when(parcelaContaPagarRepository.somarVencidasPorUsuario(LocalDate.now(), 1L)).thenReturn(new BigDecimal("100.00"));
        when(animalRepository.countByUsuarioId(1L)).thenReturn(10L);
        when(animalRepository.countByStatusAndUsuarioId(StatusAnimal.ATIVO, 1L)).thenReturn(6L);
        when(animalRepository.countByStatusAndUsuarioId(StatusAnimal.VENDIDO, 1L)).thenReturn(3L);
        when(animalRepository.countByStatusAndUsuarioId(StatusAnimal.INATIVO, 1L)).thenReturn(1L);
        when(pastoRepository.countByUsuarioId(1L)).thenReturn(2L);
        when(vendaRepository.countByUsuarioId(1L)).thenReturn(3L);

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
        when(usuarioAutenticadoService.getUsuarioAutenticadoId()).thenReturn(1L);
        when(animalRepository.somarTotalGastoPorUsuario(1L)).thenReturn(null);
        when(vendaRepository.somarGanhoTotalPorUsuario(1L)).thenReturn(null);
        when(pagamentoVendaRepository.somarPorStatusAndUsuarioId(StatusPagamento.PAGO, 1L)).thenReturn(null);
        when(pagamentoVendaRepository.somarAReceberPorUsuario(1L)).thenReturn(null);
        when(parcelaContaPagarRepository.somarPorStatusAndUsuarioId(StatusParcelaContaPagar.PAGA, 1L)).thenReturn(null);
        when(parcelaContaPagarRepository.somarAPagarPorUsuario(1L)).thenReturn(null);
        when(parcelaContaPagarRepository.somarVencidasPorUsuario(LocalDate.now(), 1L)).thenReturn(null);

        FinanceiroResumoDTO resumo = financeiroService.gerarResumo();

        assertThat(resumo.totalGasto()).isEqualByComparingTo("0.00");
        assertThat(resumo.ganhoTotal()).isEqualByComparingTo("0.00");
        assertThat(resumo.lucroTotal()).isEqualByComparingTo("0.00");
        assertThat(resumo.saldoRealizado()).isEqualByComparingTo("0.00");
        assertThat(resumo.saldoProjetado()).isEqualByComparingTo("0.00");
    }
}
