package gestao.pecuaria.backend.contapagar.service;

import gestao.pecuaria.backend.contapagar.dto.CriarContaPagarRequestDTO;
import gestao.pecuaria.backend.contapagar.dto.ContaPagarResponseDTO;
import gestao.pecuaria.backend.contapagar.dto.ContaPagarResumoDTO;
import gestao.pecuaria.backend.contapagar.dto.RegistrarPagamentoParcelaRequestDTO;
import gestao.pecuaria.backend.contapagar.entity.ContaPagar;
import gestao.pecuaria.backend.contapagar.entity.ParcelaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.CategoriaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;
import gestao.pecuaria.backend.contapagar.repository.ContaPagarRepository;
import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioAutenticadoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static gestao.pecuaria.backend.TestSecurityUtils.usuario;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContaPagarServiceTest {

    @Mock
    private ContaPagarRepository contaPagarRepository;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private ContaPagarService contaPagarService;

    private Usuario usuario;

    @BeforeEach
    void configurarUsuario() {
        usuario = usuario("conta-pagar@teste.com");
        usuario.setId(1L);
        lenient().when(usuarioAutenticadoService.getUsuarioAutenticado()).thenReturn(usuario);
        lenient().when(usuarioAutenticadoService.getUsuarioAutenticadoId()).thenReturn(usuario.getId());
    }

    @Test
    void deveCriarContaAVistaComUmaParcelaPendente() {
        when(contaPagarRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ContaPagarResponseDTO resposta = contaPagarService.criar(new CriarContaPagarRequestDTO(
                "Compra de animal",
                CategoriaContaPagar.ANIMAL,
                "Fornecedor Rural",
                new BigDecimal("2500.00"),
                LocalDate.of(2026, 10, 9),
                TipoPagamentoContaPagar.A_VISTA,
                null,
                null,
                null,
                null,
                "Pagamento à vista"
        ));

        assertThat(resposta.status()).isEqualTo(StatusContaPagar.PENDENTE);
        assertThat(resposta.quantidadeParcelas()).isEqualTo(1);
        assertThat(resposta.parcelas()).singleElement().satisfies(parcela -> {
            assertThat(parcela.numeroParcela()).isEqualTo(1);
            assertThat(parcela.valor()).isEqualByComparingTo("2500.00");
            assertThat(parcela.dataVencimento()).isEqualTo(LocalDate.of(2026, 10, 9));
            assertThat(parcela.status()).isEqualTo(StatusParcelaContaPagar.PENDENTE);
        });
    }

    @Test
    void deveCriarContaPrazoComVencimentoInformado() {
        when(contaPagarRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ContaPagarResponseDTO resposta = contaPagarService.criar(criarRequest(
                new BigDecimal("6000.00"),
                TipoPagamentoContaPagar.PRAZO,
                LocalDate.of(2027, 1, 4),
                null,
                null,
                null
        ));

        assertThat(resposta.parcelas()).singleElement().satisfies(parcela -> {
            assertThat(parcela.valor()).isEqualByComparingTo("6000.00");
            assertThat(parcela.dataVencimento()).isEqualTo(LocalDate.of(2027, 1, 4));
        });
    }

    @Test
    void deveCriarContaParceladaComIntervaloEmDias() {
        when(contaPagarRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ContaPagarResponseDTO resposta = contaPagarService.criar(criarRequest(
                new BigDecimal("4000.00"),
                TipoPagamentoContaPagar.PARCELADO,
                null,
                4,
                LocalDate.of(2026, 11, 6),
                30
        ));

        assertThat(resposta.parcelas()).extracting(parcela -> parcela.dataVencimento())
                .containsExactly(
                        LocalDate.of(2026, 11, 6),
                        LocalDate.of(2026, 12, 6),
                        LocalDate.of(2027, 1, 5),
                        LocalDate.of(2027, 2, 4)
                );
    }

    @Test
    void deveColocarDiferencaDeArredondamentoNaUltimaParcela() {
        when(contaPagarRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ContaPagarResponseDTO resposta = contaPagarService.criar(criarRequest(
                new BigDecimal("1000.00"),
                TipoPagamentoContaPagar.PARCELADO,
                null,
                3,
                LocalDate.of(2026, 11, 6),
                30
        ));

        assertThat(resposta.parcelas()).extracting(parcela -> parcela.valor())
                .containsExactly(
                        new BigDecimal("333.33"),
                        new BigDecimal("333.33"),
                        new BigDecimal("333.34")
                );
    }

    @Test
    void naoDeveCriarContaPrazoComVencimentoAnteriorACompra() {
        assertThatThrownBy(() -> contaPagarService.criar(criarRequest(
                new BigDecimal("6000.00"),
                TipoPagamentoContaPagar.PRAZO,
                LocalDate.of(2026, 10, 5),
                null,
                null,
                null
        )))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A data de vencimento não pode ser anterior à data da compra.");
    }

    @Test
    void deveRegistrarPagamentoEMudarContaParaParcialmentePaga() {
        ContaPagar conta = criarContaComParcelas("1000.00", "500.00", "500.00");
        ParcelaContaPagar primeira = conta.getParcelas().getFirst();
        when(contaPagarRepository.findByParcelaIdAndUsuarioIdForUpdate(1L, 1L)).thenReturn(Optional.of(conta));

        ContaPagarResponseDTO resposta = contaPagarService.registrarPagamento(
                1L,
                new RegistrarPagamentoParcelaRequestDTO(LocalDate.of(2026, 10, 6), FormaPagamento.PIX)
        );

        assertThat(primeira.getStatus()).isEqualTo(StatusParcelaContaPagar.PAGA);
        assertThat(primeira.getDataPagamento()).isEqualTo(LocalDate.of(2026, 10, 6));
        assertThat(primeira.getFormaPagamento()).isEqualTo(FormaPagamento.PIX);
        assertThat(resposta.status()).isEqualTo(StatusContaPagar.PARCIALMENTE_PAGA);
        assertThat(resposta.valorPago()).isEqualByComparingTo("500.00");
    }

    @Test
    void deveMudarContaParaPagaAposUltimaParcela() {
        ContaPagar conta = criarContaComParcelas("1000.00", "500.00", "500.00");
        ParcelaContaPagar primeira = conta.getParcelas().getFirst();
        primeira.setStatus(StatusParcelaContaPagar.PAGA);
        primeira.setDataPagamento(LocalDate.of(2026, 10, 5));
        ParcelaContaPagar segunda = conta.getParcelas().get(1);
        when(contaPagarRepository.findByParcelaIdAndUsuarioIdForUpdate(2L, 1L)).thenReturn(Optional.of(conta));

        ContaPagarResponseDTO resposta = contaPagarService.registrarPagamento(
                2L,
                new RegistrarPagamentoParcelaRequestDTO(LocalDate.of(2026, 10, 6), FormaPagamento.BOLETO)
        );

        assertThat(resposta.status()).isEqualTo(StatusContaPagar.PAGA);
        assertThat(resposta.valorRestante()).isEqualByComparingTo("0.00");
    }

    @Test
    void deveIdentificarParcelaVencidaComoAtrasadaSemAlterarStatusGravado() {
        ContaPagar conta = criarContaComParcelas("100.00", "100.00");
        ParcelaContaPagar parcela = conta.getParcelas().getFirst();
        parcela.setDataVencimento(LocalDate.now().minusDays(5));
        when(contaPagarRepository.findByIdAndUsuarioId(1L, 1L)).thenReturn(Optional.of(conta));

        ContaPagarResponseDTO resposta = contaPagarService.buscarPorId(1L);

        assertThat(resposta.parcelas()).singleElement().satisfies(dto -> {
            assertThat(dto.atrasada()).isTrue();
            assertThat(dto.status()).isEqualTo(StatusParcelaContaPagar.ATRASADA);
            assertThat(dto.diasParaVencimento()).isEqualTo(-5L);
        });
        assertThat(parcela.getStatus()).isEqualTo(StatusParcelaContaPagar.PENDENTE);
    }

    @Test
    void deveCancelarContaEParcelasPendentesSemApagarPagamentos() {
        ContaPagar conta = criarContaComParcelas("1000.00", "500.00", "500.00");
        conta.getParcelas().getFirst().setStatus(StatusParcelaContaPagar.PAGA);
        conta.getParcelas().getFirst().setDataPagamento(LocalDate.of(2026, 10, 5));
        when(contaPagarRepository.findByIdAndUsuarioIdForUpdate(1L, 1L)).thenReturn(Optional.of(conta));

        ContaPagarResponseDTO resposta = contaPagarService.cancelar(1L);

        assertThat(resposta.status()).isEqualTo(StatusContaPagar.CANCELADA);
        assertThat(conta.getParcelas()).extracting(ParcelaContaPagar::getStatus)
                .containsExactly(StatusParcelaContaPagar.PAGA, StatusParcelaContaPagar.CANCELADA);
    }

    @Test
    void naoDeveCancelarContaTotalmentePaga() {
        ContaPagar conta = criarContaComParcelas("500.00", "500.00");
        conta.setStatus(StatusContaPagar.PAGA);
        conta.getParcelas().getFirst().setStatus(StatusParcelaContaPagar.PAGA);
        when(contaPagarRepository.findByIdAndUsuarioIdForUpdate(1L, 1L)).thenReturn(Optional.of(conta));

        assertThatThrownBy(() -> contaPagarService.cancelar(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Uma conta totalmente paga não pode ser cancelada.");
    }

    @Test
    void naoDevePagarParcelaJaPaga() {
        ContaPagar conta = criarContaComParcelas("500.00", "500.00");
        ParcelaContaPagar parcela = conta.getParcelas().getFirst();
        parcela.setStatus(StatusParcelaContaPagar.PAGA);
        when(contaPagarRepository.findByParcelaIdAndUsuarioIdForUpdate(1L, 1L)).thenReturn(Optional.of(conta));

        assertThatThrownBy(() -> contaPagarService.registrarPagamento(
                1L,
                new RegistrarPagamentoParcelaRequestDTO(LocalDate.of(2026, 10, 6), FormaPagamento.PIX)
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A parcela já está paga.");
    }

    @Test
    void naoDeveGerarParcelaComValorZero() {
        assertThatThrownBy(() -> contaPagarService.criar(criarRequest(
                new BigDecimal("0.01"),
                TipoPagamentoContaPagar.PARCELADO,
                null,
                2,
                LocalDate.of(2026, 11, 6),
                30
        )))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("O valor total é insuficiente para a quantidade de parcelas informada.");
    }

    @Test
    void naoDeveAceitarQuantidadeExcessivaDeParcelas() {
        assertThatThrownBy(() -> contaPagarService.criar(criarRequest(
                new BigDecimal("10000.00"),
                TipoPagamentoContaPagar.PARCELADO,
                null,
                361,
                LocalDate.of(2026, 11, 6),
                30
        )))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A quantidade de parcelas não pode ser maior que 360.");
    }

    @Test
    void deveCalcularResumoFinanceiroDasParcelas() {
        LocalDate hoje = LocalDate.now();
        ContaPagar conta = criarContaComParcelas("1000.00", "100.00", "200.00", "300.00", "400.00");
        conta.getParcelas().get(0).setDataVencimento(hoje.minusDays(1));
        conta.getParcelas().get(1).setDataVencimento(hoje.plusDays(7));
        conta.getParcelas().get(2).setStatus(StatusParcelaContaPagar.PAGA);
        conta.getParcelas().get(2).setDataPagamento(hoje.withDayOfMonth(1));
        conta.getParcelas().get(3).setDataVencimento(hoje.plusDays(30));
        when(contaPagarRepository.findAllByUsuarioId(1L)).thenReturn(List.of(conta));

        ContaPagarResumoDTO resumo = contaPagarService.buscarResumo();

        assertThat(resumo.totalAPagar()).isEqualByComparingTo("700.00");
        assertThat(resumo.totalVencido()).isEqualByComparingTo("100.00");
        assertThat(resumo.totalProximos7Dias()).isEqualByComparingTo("200.00");
        assertThat(resumo.totalPagoMesAtual()).isEqualByComparingTo("300.00");
        assertThat(resumo.quantidadeVencidas()).isEqualTo(1L);
    }

    @Test
    void deveFiltrarPorVencimentoEOrdenarVencidasAntesDasFuturas() {
        LocalDate hoje = LocalDate.now();
        ContaPagar vencida = criarContaComParcelas("100.00", "100.00");
        vencida.setId(1L);
        vencida.getParcelas().getFirst().setDataVencimento(hoje.minusDays(2));
        ContaPagar futura = criarContaComParcelas("200.00", "200.00");
        futura.setId(2L);
        futura.getParcelas().getFirst().setDataVencimento(hoje.plusDays(2));
        when(contaPagarRepository.findAllByUsuarioId(1L)).thenReturn(List.of(futura, vencida));

        List<ContaPagarResponseDTO> resposta = contaPagarService.listar(
                StatusContaPagar.PENDENTE,
                CategoriaContaPagar.RACAO,
                "fornec",
                hoje.minusDays(3),
                hoje.plusDays(3)
        );

        assertThat(resposta).extracting(ContaPagarResponseDTO::id).containsExactly(1L, 2L);
    }

    private CriarContaPagarRequestDTO criarRequest(
            BigDecimal valorTotal,
            TipoPagamentoContaPagar tipoPagamento,
            LocalDate dataVencimento,
            Integer quantidadeParcelas,
            LocalDate primeiroVencimento,
            Integer intervaloDias
    ) {
        return new CriarContaPagarRequestDTO(
                "Despesa rural",
                CategoriaContaPagar.RACAO,
                "Fornecedor",
                valorTotal,
                LocalDate.of(2026, 10, 6),
                tipoPagamento,
                dataVencimento,
                quantidadeParcelas,
                primeiroVencimento,
                intervaloDias,
                null
        );
    }

    private ContaPagar criarContaComParcelas(String valorTotal, String... valoresParcelas) {
        ContaPagar conta = new ContaPagar();
        conta.setId(1L);
        conta.setUsuario(usuario);
        conta.setDescricao("Despesa");
        conta.setCategoria(CategoriaContaPagar.RACAO);
        conta.setFornecedor("Fornecedor");
        conta.setValorTotal(new BigDecimal(valorTotal));
        conta.setDataCompra(LocalDate.of(2026, 10, 1));
        conta.setTipoPagamento(valoresParcelas.length == 1
                ? TipoPagamentoContaPagar.PRAZO
                : TipoPagamentoContaPagar.PARCELADO);
        conta.setStatus(StatusContaPagar.PENDENTE);

        for (int indice = 0; indice < valoresParcelas.length; indice++) {
            ParcelaContaPagar parcela = new ParcelaContaPagar();
            parcela.setId((long) indice + 1);
            parcela.setNumeroParcela(indice + 1);
            parcela.setValor(new BigDecimal(valoresParcelas[indice]));
            parcela.setDataVencimento(LocalDate.of(2026, 11, 1).plusDays(indice * 30L));
            parcela.setStatus(StatusParcelaContaPagar.PENDENTE);
            conta.adicionarParcela(parcela);
        }
        return conta;
    }
}
