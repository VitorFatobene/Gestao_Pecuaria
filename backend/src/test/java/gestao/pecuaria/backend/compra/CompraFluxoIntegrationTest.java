package gestao.pecuaria.backend.compra;

import gestao.pecuaria.backend.TestSecurityUtils;
import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.compra.dto.CompraAnimalRequestDTO;
import gestao.pecuaria.backend.compra.dto.CompraRequestDTO;
import gestao.pecuaria.backend.compra.dto.CompraResponseDTO;
import gestao.pecuaria.backend.compra.enums.TipoRateioCompra;
import gestao.pecuaria.backend.contapagar.entity.ContaPagar;
import gestao.pecuaria.backend.contapagar.enums.OrigemContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;
import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import gestao.pecuaria.backend.contapagar.repository.ContaPagarRepository;
import gestao.pecuaria.backend.financeiro.FinanceiroService;
import gestao.pecuaria.backend.financeiro.dto.FinanceiroResumoDTO;
import gestao.pecuaria.backend.movimentacao.repository.MovimentacaoAnimalRepository;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class CompraFluxoIntegrationTest {

    private static final AtomicLong CODIGO_SEQUENCE = new AtomicLong(200000);

    @Autowired
    private CompraService compraService;

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private PastoRepository pastoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MovimentacaoAnimalRepository movimentacaoAnimalRepository;

    @Autowired
    private ContaPagarRepository contaPagarRepository;

    @Autowired
    private FinanceiroService financeiroService;

    @AfterEach
    void limparAutenticacao() {
        TestSecurityUtils.limparAutenticacao();
    }

    @Test
    void deveRegistrarCompraComUmAnimalEGerarUmaContaPagar() {
        Usuario usuario = salvarEAutenticarUsuario("compra-um-animal");
        Pasto pasto = salvarPasto(usuario);

        CompraResponseDTO response = compraService.criar(request(
                new BigDecimal("15000.00"),
                TipoRateioCompra.IGUAL,
                List.of(animalRequest(proximoCodigo(), "320.00", pasto.getId(), null))
        ));

        assertThat(response.id()).isNotNull();
        assertThat(response.quantidadeAnimais()).isEqualTo(1);
        assertThat(response.pesoTotalKg()).isEqualByComparingTo("320.00");
        assertThat(response.valorMedioAnimal()).isEqualByComparingTo("15000.00");
        assertThat(response.animais()).singleElement()
                .satisfies(animal -> assertThat(animal.valorPago()).isEqualByComparingTo("15000.00"));
        assertThat(animalRepository.findByCompraIdAndUsuarioId(response.id(), usuario.getId())).singleElement()
                .satisfies(animal -> {
                    assertThat(animal.getCompra().getId()).isEqualTo(response.id());
                    assertThat(animal.getUsuario().getId()).isEqualTo(usuario.getId());
                    assertThat(animal.getNomeVendedor()).isEqualTo("Joao");
                    assertThat(animal.getDataCompra()).isEqualTo(LocalDate.of(2026, 10, 6));
                });
        assertThat(movimentacaoAnimalRepository.findByPastoIdAndPastoUsuarioIdAndDataSaidaIsNull(pasto.getId(), usuario.getId()))
                .hasSize(1);
        assertThat(contaPagarRepository.findByCompraIdAndUsuarioId(response.id(), usuario.getId()))
                .isPresent()
                .get()
                .satisfies(conta -> {
                    assertThat(conta.getOrigem()).isEqualTo(OrigemContaPagar.COMPRA);
                    assertThat(conta.getStatus()).isEqualTo(StatusContaPagar.PENDENTE);
                    assertThat(conta.getValorTotal()).isEqualByComparingTo("15000.00");
                    assertThat(conta.getFornecedor()).isEqualTo("Joao");
                    assertThat(conta.getDescricao()).isEqualTo("Compra do animal " + response.animais().getFirst().codigoAnimal());
                    assertThat(conta.getParcelas()).singleElement().satisfies(parcela -> {
                        assertThat(parcela.getValor()).isEqualByComparingTo("15000.00");
                        assertThat(parcela.getStatus()).isEqualTo(StatusParcelaContaPagar.PENDENTE);
                    });
                });
    }

    @Test
    void deveRegistrarCompraComVariosAnimaisNaMesmaNegociacao() {
        Usuario usuario = salvarEAutenticarUsuario("compra-varios-animais");
        Pasto pasto = salvarPasto(usuario);

        CompraResponseDTO response = compraService.criar(request(
                new BigDecimal("15000.00"),
                TipoRateioCompra.IGUAL,
                List.of(
                        animalRequest(proximoCodigo(), "320.00", pasto.getId(), null),
                        animalRequest(proximoCodigo(), "280.00", pasto.getId(), null),
                        animalRequest(proximoCodigo(), "300.00", pasto.getId(), null),
                        animalRequest(proximoCodigo(), "350.00", pasto.getId(), null),
                        animalRequest(proximoCodigo(), "310.00", pasto.getId(), null)
                )
        ));

        assertThat(response.quantidadeAnimais()).isEqualTo(5);
        assertThat(response.pesoTotalKg()).isEqualByComparingTo("1560.00");
        assertThat(response.valorMedioAnimal()).isEqualByComparingTo("3000.00");
        assertThat(response.valorTotal()).isEqualByComparingTo("15000.00");
        assertThat(response.animais().stream()
                .map(animal -> animal.valorPago())
                .reduce(BigDecimal.ZERO, BigDecimal::add)).isEqualByComparingTo("15000.00");
        assertThat(animalRepository.findByCompraIdAndUsuarioId(response.id(), usuario.getId()))
                .hasSize(5)
                .allSatisfy(animal -> assertThat(animal.getCompra().getId()).isEqualTo(response.id()));
        assertThat(movimentacaoAnimalRepository.findByPastoIdAndPastoUsuarioIdAndDataSaidaIsNull(pasto.getId(), usuario.getId()))
                .hasSize(5);
        assertThat(contaPagarRepository.findByCompraIdAndUsuarioId(response.id(), usuario.getId()))
                .isPresent()
                .get()
                .satisfies(conta -> {
                    assertThat(conta.getDescricao()).isEqualTo("Compra de 5 animais");
                    assertThat(conta.getValorTotal()).isEqualByComparingTo("15000.00");
                    assertThat(conta.getParcelas()).hasSize(1);
                });
        assertThat(contaPagarRepository.findAllByUsuarioId(usuario.getId()))
                .filteredOn(conta -> conta.getCompra() != null && conta.getCompra().getId().equals(response.id()))
                .hasSize(1);

        FinanceiroResumoDTO financeiro = financeiroService.gerarResumo();
        assertThat(financeiro.totalGasto()).isEqualByComparingTo("15000.00");
        assertThat(financeiro.despesasAPagar()).isEqualByComparingTo("15000.00");
        assertThat(financeiro.saldoProjetado()).isEqualByComparingTo("-15000.00");
    }

    @Test
    void deveRegistrarCompraIndividualAVistaPagaNoAto() {
        Usuario usuario = salvarEAutenticarUsuario("compra-vista-paga");

        CompraResponseDTO response = compraService.criar(requestComPagamento(
                new BigDecimal("7000.00"),
                TipoRateioCompra.IGUAL,
                TipoPagamentoContaPagar.A_VISTA,
                true,
                LocalDate.of(2026, 10, 6),
                FormaPagamento.PIX,
                null,
                null,
                null,
                List.of(animalRequest(proximoCodigo(), "300.00", null, null))
        ));

        assertThat(contaPagarRepository.findByCompraIdAndUsuarioId(response.id(), usuario.getId()))
                .isPresent()
                .get()
                .satisfies(conta -> {
                    assertThat(conta.getStatus()).isEqualTo(StatusContaPagar.PAGA);
                    assertThat(conta.getParcelas()).singleElement().satisfies(parcela -> {
                        assertThat(parcela.getStatus()).isEqualTo(StatusParcelaContaPagar.PAGA);
                        assertThat(parcela.getDataPagamento()).isEqualTo(LocalDate.of(2026, 10, 6));
                        assertThat(parcela.getFormaPagamento()).isEqualTo(FormaPagamento.PIX);
                    });
                });
    }

    @Test
    void deveRegistrarCompraMultiplaAPrazoComUmaConta() {
        Usuario usuario = salvarEAutenticarUsuario("compra-prazo");

        CompraResponseDTO response = compraService.criar(requestComPagamento(
                new BigDecimal("9000.00"),
                TipoRateioCompra.IGUAL,
                TipoPagamentoContaPagar.PRAZO,
                false,
                null,
                null,
                LocalDate.of(2026, 11, 6),
                null,
                null,
                List.of(
                        animalRequest(proximoCodigo(), "300.00", null, null),
                        animalRequest(proximoCodigo(), "300.00", null, null)
                )
        ));

        assertThat(contaPagarRepository.findByCompraIdAndUsuarioId(response.id(), usuario.getId()))
                .isPresent()
                .get()
                .satisfies(conta -> {
                    assertThat(conta.getTipoPagamento()).isEqualTo(TipoPagamentoContaPagar.PRAZO);
                    assertThat(conta.getParcelas()).singleElement().satisfies(parcela -> {
                        assertThat(parcela.getValor()).isEqualByComparingTo("9000.00");
                        assertThat(parcela.getDataVencimento()).isEqualTo(LocalDate.of(2026, 11, 6));
                    });
                });
    }

    @Test
    void deveRegistrarCompraMultiplaParceladaFechandoValorTotal() {
        Usuario usuario = salvarEAutenticarUsuario("compra-parcelada");

        CompraResponseDTO response = compraService.criar(requestComPagamento(
                new BigDecimal("1000.00"),
                TipoRateioCompra.IGUAL,
                TipoPagamentoContaPagar.PARCELADO,
                false,
                null,
                null,
                null,
                3,
                LocalDate.of(2026, 11, 6),
                List.of(
                        animalRequest(proximoCodigo(), "300.00", null, null),
                        animalRequest(proximoCodigo(), "300.00", null, null),
                        animalRequest(proximoCodigo(), "300.00", null, null)
                )
        ));

        assertThat(contaPagarRepository.findByCompraIdAndUsuarioId(response.id(), usuario.getId()))
                .isPresent()
                .get()
                .satisfies(conta -> {
                    assertThat(conta.getParcelas()).hasSize(3);
                    assertThat(conta.getParcelas()).extracting(parcela -> parcela.getValor())
                            .containsExactly(new BigDecimal("333.33"), new BigDecimal("333.33"), new BigDecimal("333.34"));
                    assertThat(conta.getParcelas().stream()
                            .map(parcela -> parcela.getValor())
                            .reduce(BigDecimal.ZERO, BigDecimal::add)).isEqualByComparingTo("1000.00");
                });
    }

    @Test
    void deveRejeitarPagamentoNoAtoParaPrazo() {
        salvarEAutenticarUsuario("compra-pagamento-ato-invalido");

        CompraRequestDTO request = requestComPagamento(
                new BigDecimal("1000.00"),
                TipoRateioCompra.IGUAL,
                TipoPagamentoContaPagar.PRAZO,
                true,
                LocalDate.of(2026, 10, 6),
                FormaPagamento.PIX,
                LocalDate.of(2026, 11, 6),
                null,
                null,
                List.of(animalRequest(proximoCodigo(), "300.00", null, null))
        );

        assertThatThrownBy(() -> compraService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Pagamento realizado no ato só pode ser informado para compra à vista.");
    }

    @Test
    void deveRatearCompraProporcionalAoPeso() {
        salvarEAutenticarUsuario("compra-rateio-proporcional");

        CompraResponseDTO response = compraService.criar(request(
                new BigDecimal("1000.00"),
                TipoRateioCompra.PROPORCIONAL_PESO,
                List.of(
                        animalRequest(proximoCodigo(), "100.00", null, null),
                        animalRequest(proximoCodigo(), "300.00", null, null)
                )
        ));

        assertThat(response.animais()).extracting(animal -> animal.valorPago())
                .containsExactly(new BigDecimal("250.00"), new BigDecimal("750.00"));
    }

    @Test
    void deveRatearCompraIgualmente() {
        salvarEAutenticarUsuario("compra-rateio-igual");

        CompraResponseDTO response = compraService.criar(request(
                new BigDecimal("900.00"),
                TipoRateioCompra.IGUAL,
                List.of(
                        animalRequest(proximoCodigo(), "100.00", null, null),
                        animalRequest(proximoCodigo(), "300.00", null, null),
                        animalRequest(proximoCodigo(), "500.00", null, null)
                )
        ));

        assertThat(response.animais()).extracting(animal -> animal.valorPago())
                .containsExactly(new BigDecimal("300.00"), new BigDecimal("300.00"), new BigDecimal("300.00"));
    }

    @Test
    void deveAceitarRateioManualQuandoSomaFecha() {
        salvarEAutenticarUsuario("compra-rateio-manual");

        CompraResponseDTO response = compraService.criar(request(
                new BigDecimal("1000.00"),
                TipoRateioCompra.MANUAL,
                List.of(
                        animalRequest(proximoCodigo(), "100.00", null, new BigDecimal("400.00")),
                        animalRequest(proximoCodigo(), "300.00", null, new BigDecimal("600.00"))
                )
        ));

        assertThat(response.animais()).extracting(animal -> animal.valorPago())
                .containsExactly(new BigDecimal("400.00"), new BigDecimal("600.00"));
    }

    @Test
    void deveAjustarCentavosNoUltimoAnimal() {
        salvarEAutenticarUsuario("compra-centavos");

        CompraResponseDTO response = compraService.criar(request(
                new BigDecimal("100.00"),
                TipoRateioCompra.IGUAL,
                List.of(
                        animalRequest(proximoCodigo(), "100.00", null, null),
                        animalRequest(proximoCodigo(), "100.00", null, null),
                        animalRequest(proximoCodigo(), "100.00", null, null)
                )
        ));

        assertThat(response.animais()).extracting(animal -> animal.valorPago())
                .containsExactly(new BigDecimal("33.33"), new BigDecimal("33.33"), new BigDecimal("33.34"));
        assertThat(response.animais().stream()
                .map(animal -> animal.valorPago())
                .reduce(BigDecimal.ZERO, BigDecimal::add)).isEqualByComparingTo("100.00");
    }

    @Test
    void deveRejeitarCodigosDuplicadosNoRequest() {
        salvarEAutenticarUsuario("compra-codigo-duplicado");
        Long codigo = proximoCodigo();

        CompraRequestDTO request = request(
                new BigDecimal("1000.00"),
                TipoRateioCompra.IGUAL,
                List.of(
                        animalRequest(codigo, "100.00", null, null),
                        animalRequest(codigo, "120.00", null, null)
                )
        );

        assertThatThrownBy(() -> compraService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A lista de animais nao pode conter codigos duplicados.");
    }

    @Test
    void deveRejeitarCodigoDeAnimalJaExistente() {
        Usuario usuario = salvarEAutenticarUsuario("compra-codigo-existente");
        Long codigo = proximoCodigo();
        animalRepository.save(animalExistente(codigo, usuario));

        CompraRequestDTO request = request(
                new BigDecimal("1000.00"),
                TipoRateioCompra.IGUAL,
                List.of(animalRequest(codigo, "100.00", null, null))
        );

        assertThatThrownBy(() -> compraService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Um ou mais codigos de animais ja estao cadastrados.");
    }

    @Test
    void deveRejeitarPastoDeOutroUsuario() {
        Usuario usuarioA = usuarioRepository.save(TestSecurityUtils.usuario("pasto-a-" + System.nanoTime() + "@teste.com"));
        Usuario usuarioB = salvarEAutenticarUsuario("pasto-b");
        Pasto pastoOutroUsuario = salvarPasto(usuarioA);

        CompraRequestDTO request = request(
                new BigDecimal("1000.00"),
                TipoRateioCompra.IGUAL,
                List.of(animalRequest(proximoCodigo(), "100.00", pastoOutroUsuario.getId(), null))
        );

        assertThat(usuarioB.getId()).isNotEqualTo(usuarioA.getId());
        assertThatThrownBy(() -> compraService.criar(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Pasto não encontrado com o ID: " + pastoOutroUsuario.getId());
    }

    @Test
    void deveIsolarComprasEntreUsuarios() {
        Usuario usuarioA = salvarEAutenticarUsuario("compra-isolada-a");
        CompraResponseDTO compraA = compraService.criar(request(
                new BigDecimal("1000.00"),
                TipoRateioCompra.IGUAL,
                List.of(animalRequest(proximoCodigo(), "100.00", null, null))
        ));

        salvarEAutenticarUsuario("compra-isolada-b");

        assertThat(compraService.listarTodos()).isEmpty();
        assertThatThrownBy(() -> compraService.buscarPorId(compraA.id()))
                .isInstanceOf(ResourceNotFoundException.class);

        TestSecurityUtils.autenticar(usuarioA);
        assertThat(compraService.buscarPorId(compraA.id()).id()).isEqualTo(compraA.id());
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void deveFazerRollbackQuandoUmAnimalFalhar() {
        Usuario usuario = salvarUsuario("compra-rollback");
        Long codigoExistente = proximoCodigo();
        animalRepository.saveAndFlush(animalExistente(codigoExistente, usuario));
        TestSecurityUtils.autenticar(usuario);

        long totalComprasAntes = compraRepository.count();
        long totalAnimaisAntes = animalRepository.count();
        long totalMovimentacoesAntes = movimentacaoAnimalRepository.count();

        CompraRequestDTO request = request(
                new BigDecimal("1000.00"),
                TipoRateioCompra.IGUAL,
                List.of(
                        animalRequest(proximoCodigo(), "100.00", null, null),
                        animalRequest(codigoExistente, "120.00", null, null)
                )
        );

        assertThatThrownBy(() -> compraService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Um ou mais codigos de animais ja estao cadastrados.");

        assertThat(compraRepository.count()).isEqualTo(totalComprasAntes);
        assertThat(animalRepository.count()).isEqualTo(totalAnimaisAntes);
        assertThat(movimentacaoAnimalRepository.count()).isEqualTo(totalMovimentacoesAntes);
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void deveFazerRollbackQuandoContaPagarFalhar() {
        Usuario usuario = salvarUsuario("compra-rollback-conta");
        TestSecurityUtils.autenticar(usuario);

        long totalComprasAntes = compraRepository.count();
        long totalAnimaisAntes = animalRepository.count();
        long totalContasAntes = contaPagarRepository.count();

        CompraRequestDTO request = requestComPagamento(
                new BigDecimal("1000.00"),
                TipoRateioCompra.IGUAL,
                TipoPagamentoContaPagar.PRAZO,
                false,
                null,
                null,
                null,
                null,
                null,
                List.of(animalRequest(proximoCodigo(), "100.00", null, null))
        );

        assertThatThrownBy(() -> compraService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A data de vencimento é obrigatória para pagamento a prazo.");

        assertThat(compraRepository.count()).isEqualTo(totalComprasAntes);
        assertThat(animalRepository.count()).isEqualTo(totalAnimaisAntes);
        assertThat(contaPagarRepository.count()).isEqualTo(totalContasAntes);
    }

    @Test
    void deveRejeitarRateioManualQuandoSomaNaoFecha() {
        salvarEAutenticarUsuario("compra-manual-invalida");

        CompraRequestDTO request = request(
                new BigDecimal("1000.00"),
                TipoRateioCompra.MANUAL,
                List.of(
                        animalRequest(proximoCodigo(), "100.00", null, new BigDecimal("400.00")),
                        animalRequest(proximoCodigo(), "300.00", null, new BigDecimal("500.00"))
                )
        );

        assertThatThrownBy(() -> compraService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A soma dos custos manuais deve ser igual ao valor total da compra.");
    }

    private Usuario salvarEAutenticarUsuario(String prefixoEmail) {
        Usuario usuario = salvarUsuario(prefixoEmail);
        TestSecurityUtils.autenticar(usuario);
        return usuario;
    }

    private Usuario salvarUsuario(String prefixoEmail) {
        return usuarioRepository.save(TestSecurityUtils.usuario(prefixoEmail + "-" + System.nanoTime() + "@teste.com"));
    }

    private Pasto salvarPasto(Usuario usuario) {
        Pasto pasto = new Pasto();
        pasto.setNome("Pasto Teste " + System.nanoTime());
        pasto.setAreaHectares(new BigDecimal("12.50"));
        pasto.setAtivo(true);
        pasto.setUsuario(usuario);
        return pastoRepository.save(pasto);
    }

    private CompraRequestDTO request(BigDecimal valorTotal, TipoRateioCompra tipoRateio, List<CompraAnimalRequestDTO> animais) {
        return requestComPagamento(
                valorTotal,
                tipoRateio,
                TipoPagamentoContaPagar.A_VISTA,
                false,
                null,
                null,
                null,
                null,
                null,
                animais
        );
    }

    private CompraRequestDTO requestComPagamento(
            BigDecimal valorTotal,
            TipoRateioCompra tipoRateio,
            TipoPagamentoContaPagar tipoPagamento,
            boolean pagamentoRealizadoNoAto,
            LocalDate dataPagamento,
            FormaPagamento formaPagamento,
            LocalDate dataVencimento,
            Integer quantidadeParcelas,
            LocalDate primeiroVencimento,
            List<CompraAnimalRequestDTO> animais
    ) {
        return new CompraRequestDTO(
                "Joao",
                LocalDate.of(2026, 10, 6),
                valorTotal,
                "Compra de animais.",
                tipoRateio,
                tipoPagamento,
                pagamentoRealizadoNoAto,
                dataPagamento,
                formaPagamento,
                dataVencimento,
                quantidadeParcelas,
                primeiroVencimento,
                30,
                animais
        );
    }

    private CompraAnimalRequestDTO animalRequest(Long codigoAnimal, String pesoKg, Long pastoId, BigDecimal valorPago) {
        return new CompraAnimalRequestDTO(
                codigoAnimal,
                "Nelore",
                SexoAnimal.MACHO,
                new BigDecimal(pesoKg),
                null,
                pastoId,
                valorPago
        );
    }

    private Animal animalExistente(Long codigoAnimal, Usuario usuario) {
        Animal animal = new Animal();
        animal.setUsuario(usuario);
        animal.setCodigoAnimal(codigoAnimal);
        animal.setRaca("Nelore");
        animal.setSexo(SexoAnimal.MACHO);
        animal.setPesoKg(new BigDecimal("420.00"));
        animal.setValorPago(new BigDecimal("9000.00"));
        animal.setValorFrete(BigDecimal.ZERO);
        animal.setNomeVendedor("Fazenda Santa Luzia");
        animal.setDataCompra(LocalDate.of(2026, 10, 6));
        animal.setStatus(StatusAnimal.ATIVO);
        return animal;
    }

    private Long proximoCodigo() {
        return CODIGO_SEQUENCE.incrementAndGet();
    }
}
