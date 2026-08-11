package gestao.pecuaria.backend.pagamento.service;

import gestao.pecuaria.backend.pagamento.dto.CondicaoPagamentoDTO;
import gestao.pecuaria.backend.pagamento.entity.PagamentoVenda;
import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import gestao.pecuaria.backend.pagamento.enums.StatusPagamento;
import gestao.pecuaria.backend.pagamento.enums.TipoPagamento;
import gestao.pecuaria.backend.pagamento.repository.PagamentoVendaRepository;
import gestao.pecuaria.backend.venda.Venda;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PagamentoServiceTest {

    @Mock
    private PagamentoVendaRepository pagamentoVendaRepository;

    @InjectMocks
    private PagamentoService pagamentoService;

    @Test
    void deveGerarPagamentoAVistaPago() {
        Venda venda = criarVenda("100000.00");
        when(pagamentoVendaRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<PagamentoVenda> pagamentos = pagamentoService.gerarPagamentoVista(venda, FormaPagamento.PIX);

        assertThat(pagamentos).hasSize(1);
        PagamentoVenda pagamento = pagamentos.getFirst();
        assertThat(pagamento.getVenda()).isSameAs(venda);
        assertThat(pagamento.getNumeroParcela()).isEqualTo(1);
        assertThat(pagamento.getValor()).isEqualByComparingTo("100000.00");
        assertThat(pagamento.getDataVencimento()).isEqualTo(LocalDate.of(2026, 8, 11));
        assertThat(pagamento.getDataPagamento()).isEqualTo(LocalDate.of(2026, 8, 11));
        assertThat(pagamento.getStatus()).isEqualTo(StatusPagamento.PAGO);
        assertThat(pagamento.getFormaPagamento()).isEqualTo(FormaPagamento.PIX);
    }

    @Test
    void deveGerarPagamentoPrazoPendenteComVencimentoFuturo() {
        Venda venda = criarVenda("100000.00");
        CondicaoPagamentoDTO condicao = new CondicaoPagamentoDTO(
                TipoPagamento.PRAZO,
                null,
                null,
                null,
                30
        );
        when(pagamentoVendaRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<PagamentoVenda> pagamentos = pagamentoService.gerarPagamentoPrazo(venda, condicao, FormaPagamento.BOLETO);

        assertThat(pagamentos).hasSize(1);
        PagamentoVenda pagamento = pagamentos.getFirst();
        assertThat(pagamento.getNumeroParcela()).isEqualTo(1);
        assertThat(pagamento.getValor()).isEqualByComparingTo("100000.00");
        assertThat(pagamento.getDataVencimento()).isEqualTo(LocalDate.of(2026, 9, 10));
        assertThat(pagamento.getDataPagamento()).isNull();
        assertThat(pagamento.getStatus()).isEqualTo(StatusPagamento.PENDENTE);
        assertThat(pagamento.getFormaPagamento()).isEqualTo(FormaPagamento.BOLETO);
    }

    @Test
    void deveGerarEntradaMaisParcelasComValorRestanteDistribuido() {
        Venda venda = criarVenda("100000.00");
        CondicaoPagamentoDTO condicao = new CondicaoPagamentoDTO(
                TipoPagamento.PARCELADO,
                new BigDecimal("20000.00"),
                4,
                30,
                30
        );
        when(pagamentoVendaRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<PagamentoVenda> pagamentos = pagamentoService.gerarPagamentoParcelado(venda, condicao, FormaPagamento.TRANSFERENCIA);

        assertThat(pagamentos).hasSize(5);
        assertThat(pagamentos)
                .extracting(PagamentoVenda::getValor)
                .containsExactly(
                        new BigDecimal("20000.00"),
                        new BigDecimal("20000.00"),
                        new BigDecimal("20000.00"),
                        new BigDecimal("20000.00"),
                        new BigDecimal("20000.00")
                );
        assertThat(pagamentos)
                .extracting(PagamentoVenda::getStatus)
                .containsExactly(
                        StatusPagamento.PAGO,
                        StatusPagamento.PENDENTE,
                        StatusPagamento.PENDENTE,
                        StatusPagamento.PENDENTE,
                        StatusPagamento.PENDENTE
                );
        assertThat(pagamentos)
                .extracting(PagamentoVenda::getDataVencimento)
                .containsExactly(
                        LocalDate.of(2026, 8, 11),
                        LocalDate.of(2026, 9, 10),
                        LocalDate.of(2026, 10, 10),
                        LocalDate.of(2026, 11, 9),
                        LocalDate.of(2026, 12, 9)
                );
    }

    @Test
    void deveDistribuirCentavosSemPerderValorTotal() {
        Venda venda = criarVenda("100.00");
        CondicaoPagamentoDTO condicao = new CondicaoPagamentoDTO(
                TipoPagamento.PARCELADO,
                BigDecimal.ZERO,
                3,
                30,
                0
        );
        when(pagamentoVendaRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<PagamentoVenda> pagamentos = pagamentoService.gerarPagamentoParcelado(venda, condicao, FormaPagamento.OUTROS);

        assertThat(pagamentos)
                .extracting(PagamentoVenda::getValor)
                .containsExactly(
                        new BigDecimal("33.34"),
                        new BigDecimal("33.33"),
                        new BigDecimal("33.33")
                );
        assertThat(pagamentos.stream().map(PagamentoVenda::getValor).reduce(BigDecimal.ZERO, BigDecimal::add))
                .isEqualByComparingTo("100.00");
    }

    private Venda criarVenda(String valorTotal) {
        Venda venda = new Venda();
        venda.setId(1L);
        venda.setValorTotal(new BigDecimal(valorTotal));
        venda.setDataVenda(LocalDate.of(2026, 8, 11));
        return venda;
    }
}
