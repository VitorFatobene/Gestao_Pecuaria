package gestao.pecuaria.backend.venda;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.lote.Lote;
import gestao.pecuaria.backend.lote.LoteRepository;
import gestao.pecuaria.backend.lote.enums.StatusLote;
import gestao.pecuaria.backend.movimentacao.service.MovimentacaoAnimalService;
import gestao.pecuaria.backend.pagamento.dto.CondicaoPagamentoDTO;
import gestao.pecuaria.backend.pagamento.dto.PagamentoVendaResponseDTO;
import gestao.pecuaria.backend.pagamento.entity.PagamentoVenda;
import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import gestao.pecuaria.backend.pagamento.enums.StatusPagamento;
import gestao.pecuaria.backend.pagamento.enums.TipoPagamento;
import gestao.pecuaria.backend.pagamento.repository.PagamentoVendaRepository;
import gestao.pecuaria.backend.pagamento.service.PagamentoService;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioAutenticadoService;
import gestao.pecuaria.backend.venda.dto.RegistrarRecebimentoVendaRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaLoteRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaResponseDTO;
import gestao.pecuaria.backend.venda.enums.StatusVenda;
import gestao.pecuaria.backend.pasto.Pasto;
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
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VendaServiceTest {

    @Mock
    private VendaRepository vendaRepository;

    @Mock
    private LoteRepository loteRepository;

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private PagamentoService pagamentoService;

    @Mock
    private PagamentoVendaRepository pagamentoVendaRepository;

    @Mock
    private MovimentacaoAnimalService movimentacaoAnimalService;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @InjectMocks
    private VendaService vendaService;

    private Usuario usuario;

    @BeforeEach
    void configurarUsuario() {
        usuario = usuario("venda@teste.com");
        usuario.setId(1L);
        lenient().when(usuarioAutenticadoService.getUsuarioAutenticado()).thenReturn(usuario);
        lenient().when(usuarioAutenticadoService.getUsuarioAutenticadoId()).thenReturn(usuario.getId());
    }

    @Test
    void deveCriarVendaParaLote() {
        Lote lote = criarLote(StatusLote.ABERTO);
        VendaRequestDTO request = criarRequest();
        Animal animal1 = criarAnimal("300.00");
        Animal animal2 = criarAnimal("250.50");

        when(loteRepository.findByIdAndUsuarioId(1L, 1L)).thenReturn(Optional.of(lote));
        when(animalRepository.existsByLoteIdAndUsuarioId(1L, 1L)).thenReturn(true);
        when(vendaRepository.existsByLoteIdAndUsuarioId(1L, 1L)).thenReturn(false);
        when(vendaRepository.save(any(Venda.class))).thenAnswer(invocation -> {
            Venda venda = invocation.getArgument(0);
            venda.setId(10L);
            return venda;
        });
        when(animalRepository.findByLoteIdAndUsuarioId(1L, 1L)).thenReturn(List.of(animal1, animal2));

        VendaResponseDTO response = vendaService.criar(request);

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.loteId()).isEqualTo(1L);
        assertThat(response.nomeLote()).isEqualTo("Lote Nelore");
        assertThat(response.valorTotal()).isEqualByComparingTo("8500.00");
        assertThat(response.quantidadeAnimaisLote()).isEqualTo(2);
        assertThat(response.pesoTotalKgLote()).isEqualByComparingTo("550.50");
        assertThat(response.status()).isEqualTo(StatusVenda.AGUARDANDO_PAGAMENTO);
        assertThat(response.pagamento()).isNull();
        assertThat(response.pagamentos()).isEmpty();
        assertThat(lote.getStatus()).isEqualTo(StatusLote.VENDIDO);
        assertThat(animal1.getStatus()).isEqualTo(StatusAnimal.VENDIDO);
        assertThat(animal2.getStatus()).isEqualTo(StatusAnimal.VENDIDO);
        assertThat(animal1.getPasto()).isNull();
        assertThat(animal2.getPasto()).isNull();
        verify(movimentacaoAnimalService).encerrarMovimentacaoAtual(animal1, request.dataVenda());
        verify(movimentacaoAnimalService).encerrarMovimentacaoAtual(animal2, request.dataVenda());
    }

    @Test
    void deveRealizarVendaCompletaDeLoteParcelada() {
        Lote lote = criarLote(StatusLote.ABERTO);
        Animal animal1 = criarAnimal("300.00");
        animal1.setStatus(StatusAnimal.ATIVO);
        Animal animal2 = criarAnimal("250.50");
        animal2.setStatus(StatusAnimal.ATIVO);
        VendaLoteRequestDTO request = criarVendaLoteRequest(TipoPagamento.PARCELADO);

        when(loteRepository.findByIdAndUsuarioId(1L, 1L)).thenReturn(Optional.of(lote));
        when(animalRepository.findByLoteIdAndUsuarioId(1L, 1L)).thenReturn(List.of(animal1, animal2));
        when(vendaRepository.existsByLoteIdAndUsuarioId(1L, 1L)).thenReturn(false);
        when(vendaRepository.save(any(Venda.class))).thenAnswer(invocation -> {
            Venda venda = invocation.getArgument(0);
            venda.setId(20L);
            return venda;
        });
        when(pagamentoService.gerarPagamentoParcelado(any(Venda.class), any(CondicaoPagamentoDTO.class), org.mockito.ArgumentMatchers.isNull()))
                .thenAnswer(invocation -> List.of(criarPagamento(invocation.getArgument(0), 1, "20000.00", StatusPagamento.PAGO)));
        when(loteRepository.save(lote)).thenReturn(lote);
        when(animalRepository.saveAll(anyList())).thenReturn(List.of(animal1, animal2));

        VendaResponseDTO response = vendaService.realizarVendaLote(request);

        assertThat(response.id()).isEqualTo(20L);
        assertThat(response.loteId()).isEqualTo(1L);
        assertThat(response.nomeComprador()).isEqualTo("Frigorífico Boa Carne");
        assertThat(response.valorTotal()).isEqualByComparingTo("100000.00");
        assertThat(response.pesoKgVenda()).isEqualByComparingTo("550.50");
        assertThat(response.statusLote()).isEqualTo(StatusLote.VENDIDO);
        assertThat(response.quantidadeAnimaisLote()).isEqualTo(2L);
        assertThat(response.pagamento()).isNotNull();
        assertThat(response.pagamento().tipoPagamento()).isEqualTo("A_VISTA");
        assertThat(response.pagamento().parcelaAtual()).isNull();
        assertThat(response.pagamento().totalParcelas()).isNull();
        assertThat(response.pagamentos()).hasSize(1);
        assertThat(lote.getStatus()).isEqualTo(StatusLote.VENDIDO);
        assertThat(animal1.getStatus()).isEqualTo(StatusAnimal.VENDIDO);
        assertThat(animal2.getStatus()).isEqualTo(StatusAnimal.VENDIDO);
        assertThat(animal1.getPasto()).isNull();
        assertThat(animal2.getPasto()).isNull();
        verify(pagamentoService).gerarPagamentoParcelado(any(Venda.class), any(CondicaoPagamentoDTO.class), org.mockito.ArgumentMatchers.isNull());
        verify(loteRepository).save(lote);
        verify(animalRepository).saveAll(List.of(animal1, animal2));
        verify(movimentacaoAnimalService).encerrarMovimentacaoAtual(animal1, request.dataVenda());
        verify(movimentacaoAnimalService).encerrarMovimentacaoAtual(animal2, request.dataVenda());
    }

    @Test
    void deveBloquearVendaQuandoLoteNaoExiste() {
        VendaRequestDTO request = criarRequest();
        when(loteRepository.findByIdAndUsuarioId(1L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vendaService.criar(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Lote não encontrado com o ID: 1");

        verify(vendaRepository, never()).save(any(Venda.class));
    }

    @Test
    void deveBloquearVendaQuandoLoteNaoPossuiAnimais() {
        Lote lote = criarLote(StatusLote.ABERTO);
        VendaRequestDTO request = criarRequest();

        when(loteRepository.findByIdAndUsuarioId(1L, 1L)).thenReturn(Optional.of(lote));
        when(animalRepository.existsByLoteIdAndUsuarioId(1L, 1L)).thenReturn(false);

        assertThatThrownBy(() -> vendaService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Não é possível vender um lote sem animais.");

        verify(vendaRepository, never()).save(any(Venda.class));
    }

    @Test
    void deveBloquearVendaQuandoLoteJaEstaVendido() {
        Lote lote = criarLote(StatusLote.VENDIDO);
        VendaRequestDTO request = criarRequest();

        when(loteRepository.findByIdAndUsuarioId(1L, 1L)).thenReturn(Optional.of(lote));
        when(animalRepository.existsByLoteIdAndUsuarioId(1L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> vendaService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Este lote já foi vendido.");

        verify(vendaRepository, never()).save(any(Venda.class));
    }

    @Test
    void deveBloquearVendaCompletaQuandoLoteEstaCancelado() {
        Lote lote = criarLote(StatusLote.CANCELADO);
        VendaLoteRequestDTO request = criarVendaLoteRequest(TipoPagamento.A_VISTA);

        when(loteRepository.findByIdAndUsuarioId(1L, 1L)).thenReturn(Optional.of(lote));

        assertThatThrownBy(() -> vendaService.realizarVendaLote(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Não é possível vender um lote cancelado.");

        verify(vendaRepository, never()).save(any(Venda.class));
    }

    @Test
    void deveBloquearVendaCompletaQuandoAnimalJaEstaVendido() {
        Lote lote = criarLote(StatusLote.ABERTO);
        Animal animal = criarAnimal("300.00");
        animal.setStatus(StatusAnimal.VENDIDO);
        VendaLoteRequestDTO request = criarVendaLoteRequest(TipoPagamento.A_VISTA);

        when(loteRepository.findByIdAndUsuarioId(1L, 1L)).thenReturn(Optional.of(lote));
        when(animalRepository.findByLoteIdAndUsuarioId(1L, 1L)).thenReturn(List.of(animal));

        assertThatThrownBy(() -> vendaService.realizarVendaLote(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Não é possível vender lote com animal já vendido.");

        verify(vendaRepository, never()).save(any(Venda.class));
    }

    @Test
    void deveBloquearVendaDuplicadaParaMesmoLote() {
        Lote lote = criarLote(StatusLote.ABERTO);
        VendaRequestDTO request = criarRequest();

        when(loteRepository.findByIdAndUsuarioId(1L, 1L)).thenReturn(Optional.of(lote));
        when(animalRepository.existsByLoteIdAndUsuarioId(1L, 1L)).thenReturn(true);
        when(vendaRepository.existsByLoteIdAndUsuarioId(1L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> vendaService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Já existe um registro de venda para este lote.");

        verify(vendaRepository, never()).save(any(Venda.class));
    }

    @Test
    void deveRegistrarRecebimentoAntecipadoDeVendaAPrazo() {
        Lote lote = criarLote(StatusLote.VENDIDO);
        Venda venda = criarVenda(lote, "1500.00");
        Animal animal = criarAnimal("450.00");
        PagamentoVenda pagamento = criarPagamento(venda, 1, "1500.00", StatusPagamento.PENDENTE);
        pagamento.setDataVencimento(LocalDate.of(2026, 10, 20));

        when(vendaRepository.findByIdAndUsuarioIdForUpdate(10L, 1L)).thenReturn(Optional.of(venda));
        when(pagamentoVendaRepository.findByVendaIdOrderByNumeroParcelaAsc(10L)).thenReturn(List.of(pagamento));
        when(animalRepository.findByLoteIdAndUsuarioId(1L, 1L)).thenReturn(List.of(animal));
        when(pagamentoVendaRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        VendaResponseDTO resposta = vendaService.registrarRecebimento(
                10L,
                new RegistrarRecebimentoVendaRequestDTO(LocalDate.of(2026, 10, 12), FormaPagamento.PIX)
        );

        assertThat(pagamento.getStatus()).isEqualTo(StatusPagamento.PAGO);
        assertThat(pagamento.getDataPagamento()).isEqualTo(LocalDate.of(2026, 10, 12));
        assertThat(pagamento.getDataVencimento()).isEqualTo(LocalDate.of(2026, 10, 20));
        assertThat(pagamento.getFormaPagamento()).isEqualTo(FormaPagamento.PIX);
        assertThat(resposta.status()).isEqualTo(StatusVenda.PAGA);
        assertThat(resposta.pagamentos()).singleElement().satisfies(dto -> {
            assertThat(dto.valor()).isEqualByComparingTo("1500.00");
            assertThat(dto.status()).isEqualTo(StatusPagamento.PAGO);
            assertThat(dto.dataPagamento()).isEqualTo(LocalDate.of(2026, 10, 12));
            assertThat(dto.formaPagamento()).isEqualTo(FormaPagamento.PIX);
        });
    }

    @Test
    void deveQuitarSomenteSaldoRestanteQuandoExistePagamentoParcial() {
        Lote lote = criarLote(StatusLote.VENDIDO);
        Venda venda = criarVenda(lote, "10000.00");
        Animal animal = criarAnimal("450.00");
        PagamentoVenda entradaPaga = criarPagamento(venda, 1, "4000.00", StatusPagamento.PAGO);
        PagamentoVenda saldoPendente = criarPagamento(venda, 2, "6000.00", StatusPagamento.PENDENTE);

        when(vendaRepository.findByIdAndUsuarioIdForUpdate(10L, 1L)).thenReturn(Optional.of(venda));
        when(pagamentoVendaRepository.findByVendaIdOrderByNumeroParcelaAsc(10L)).thenReturn(List.of(entradaPaga, saldoPendente));
        when(animalRepository.findByLoteIdAndUsuarioId(1L, 1L)).thenReturn(List.of(animal));
        when(pagamentoVendaRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        VendaResponseDTO resposta = vendaService.registrarRecebimento(
                10L,
                new RegistrarRecebimentoVendaRequestDTO(LocalDate.of(2026, 10, 12), FormaPagamento.TRANSFERENCIA)
        );

        assertThat(entradaPaga.getValor()).isEqualByComparingTo("4000.00");
        assertThat(saldoPendente.getValor()).isEqualByComparingTo("6000.00");
        assertThat(saldoPendente.getStatus()).isEqualTo(StatusPagamento.PAGO);
        assertThat(saldoPendente.getDataPagamento()).isEqualTo(LocalDate.of(2026, 10, 12));
        assertThat(saldoPendente.getFormaPagamento()).isEqualTo(FormaPagamento.TRANSFERENCIA);
        assertThat(resposta.status()).isEqualTo(StatusVenda.PAGA);
        assertThat(resposta.pagamentos()).extracting(PagamentoVendaResponseDTO::valor)
                .containsExactly(new BigDecimal("4000.00"), new BigDecimal("6000.00"));
    }

    @Test
    void naoDeveRegistrarRecebimentoDuplicadoQuandoVendaJaEstaPaga() {
        Lote lote = criarLote(StatusLote.VENDIDO);
        Venda venda = criarVenda(lote, "1500.00");
        PagamentoVenda pagamento = criarPagamento(venda, 1, "1500.00", StatusPagamento.PAGO);

        when(vendaRepository.findByIdAndUsuarioIdForUpdate(10L, 1L)).thenReturn(Optional.of(venda));
        when(pagamentoVendaRepository.findByVendaIdOrderByNumeroParcelaAsc(10L)).thenReturn(List.of(pagamento));

        assertThatThrownBy(() -> vendaService.registrarRecebimento(
                10L,
                new RegistrarRecebimentoVendaRequestDTO(LocalDate.of(2026, 10, 12), FormaPagamento.PIX)
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A venda já está quitada.");

        verify(pagamentoVendaRepository, never()).saveAll(anyList());
    }

    @Test
    void deveRetornarNaoEncontradoQuandoVendaPertenceAOutroUsuario() {
        when(vendaRepository.findByIdAndUsuarioIdForUpdate(10L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vendaService.registrarRecebimento(
                10L,
                new RegistrarRecebimentoVendaRequestDTO(LocalDate.of(2026, 10, 12), FormaPagamento.PIX)
        ))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Venda não encontrada com o ID: 10");

        verify(pagamentoVendaRepository, never()).findByVendaIdOrderByNumeroParcelaAsc(10L);
    }

    private VendaRequestDTO criarRequest() {
        return new VendaRequestDTO(
                1L,
                "Frigorífico Boa Carne",
                new BigDecimal("8500.00"),
                LocalDate.of(2026, 8, 11),
                new BigDecimal("550.50")
        );
    }

    private VendaLoteRequestDTO criarVendaLoteRequest(TipoPagamento tipoPagamento) {
        return new VendaLoteRequestDTO(
                1L,
                "Frigorífico Boa Carne",
                new BigDecimal("100000.00"),
                LocalDate.of(2026, 8, 11),
                new CondicaoPagamentoDTO(
                        tipoPagamento,
                        new BigDecimal("20000.00"),
                        4,
                        30,
                        30
                )
        );
    }

    private Lote criarLote(StatusLote status) {
        Lote lote = new Lote();
        lote.setId(1L);
        lote.setNome("Lote Nelore");
        lote.setStatus(status);
        lote.setUsuario(usuario);
        return lote;
    }

    private Animal criarAnimal(String pesoKg) {
        Animal animal = new Animal();
        animal.setPasto(criarPasto());
        animal.setPesoKg(new BigDecimal(pesoKg));
        animal.setStatus(StatusAnimal.ATIVO);
        animal.setUsuario(usuario);
        return animal;
    }

    private Pasto criarPasto() {
        Pasto pasto = new Pasto();
        pasto.setId(10L);
        pasto.setNome("Pasto 01");
        pasto.setUsuario(usuario);
        return pasto;
    }

    private Venda criarVenda(Lote lote, String valorTotal) {
        Venda venda = new Venda();
        venda.setId(10L);
        venda.setLote(lote);
        venda.setUsuario(usuario);
        venda.setNomeComprador("Frigorífico Boa Carne");
        venda.setValorTotal(new BigDecimal(valorTotal));
        venda.setDataVenda(LocalDate.of(2026, 8, 11));
        venda.setPesoKgVenda(new BigDecimal("450.00"));
        return venda;
    }

    private PagamentoVenda criarPagamento(Venda venda, int numeroParcela, String valor, StatusPagamento status) {
        PagamentoVenda pagamento = new PagamentoVenda();
        pagamento.setId((long) numeroParcela);
        pagamento.setVenda(venda);
        pagamento.setNumeroParcela(numeroParcela);
        pagamento.setValor(new BigDecimal(valor));
        pagamento.setDataVencimento(LocalDate.of(2026, 8, 11));
        pagamento.setDataPagamento(status == StatusPagamento.PAGO ? LocalDate.of(2026, 8, 11) : null);
        pagamento.setStatus(status);
        return pagamento;
    }
}
