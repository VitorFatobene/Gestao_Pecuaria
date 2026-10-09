package gestao.pecuaria.backend.security;

import gestao.pecuaria.backend.TestSecurityUtils;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.AnimalService;
import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.dto.AnimalResponseDTO;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.cotacao.service.CotacaoService;
import gestao.pecuaria.backend.contapagar.dto.ContaPagarResponseDTO;
import gestao.pecuaria.backend.contapagar.dto.CriarContaPagarRequestDTO;
import gestao.pecuaria.backend.contapagar.dto.RegistrarPagamentoParcelaRequestDTO;
import gestao.pecuaria.backend.contapagar.enums.CategoriaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.OrigemContaPagar;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;
import gestao.pecuaria.backend.contapagar.repository.ContaPagarRepository;
import gestao.pecuaria.backend.contapagar.service.ContaPagarService;
import gestao.pecuaria.backend.dashboard.service.DashboardService;
import gestao.pecuaria.backend.financeiro.FinanceiroService;
import gestao.pecuaria.backend.lote.LoteService;
import gestao.pecuaria.backend.lote.dto.AdicionarAnimaisLoteRequestDTO;
import gestao.pecuaria.backend.lote.dto.LoteRequestDTO;
import gestao.pecuaria.backend.lote.dto.LoteResponseDTO;
import gestao.pecuaria.backend.pagamento.dto.CondicaoPagamentoDTO;
import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import gestao.pecuaria.backend.pagamento.enums.TipoPagamento;
import gestao.pecuaria.backend.pasto.PastoService;
import gestao.pecuaria.backend.pasto.dto.PastoRequestDTO;
import gestao.pecuaria.backend.pasto.dto.PastoResponseDTO;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioRepository;
import gestao.pecuaria.backend.venda.VendaService;
import gestao.pecuaria.backend.venda.dto.VendaLoteRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaResponseDTO;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class DataIsolationIntegrationTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AnimalService animalService;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private PastoService pastoService;

    @Autowired
    private LoteService loteService;

    @Autowired
    private VendaService vendaService;

    @Autowired
    private ContaPagarService contaPagarService;

    @Autowired
    private ContaPagarRepository contaPagarRepository;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private FinanceiroService financeiroService;

    @MockitoBean
    private CotacaoService cotacaoService;

    @AfterEach
    void limparAutenticacao() {
        TestSecurityUtils.limparAutenticacao();
    }

    @Test
    void deveIsolarDadosEntreUsuariosAutenticados() {
        Usuario usuarioA = salvarUsuario("a-" + System.nanoTime() + "@teste.com");
        Usuario usuarioB = salvarUsuario("b-" + System.nanoTime() + "@teste.com");

        TestSecurityUtils.autenticar(usuarioA);
        PastoResponseDTO pastoA = pastoService.criar(new PastoRequestDTO("Pasto A", new BigDecimal("10.00"), null, true));
        AnimalResponseDTO animalA = animalService.criar(criarAnimalRequest(9101L, pastoA.id(), "1000.00"));
        LoteResponseDTO loteA = loteService.criar(new LoteRequestDTO("Lote A", null));
        loteService.adicionarAnimais(loteA.id(), new AdicionarAnimaisLoteRequestDTO(List.of(animalA.id())));
        ContaPagarResponseDTO contaA = contaPagarService.criar(criarContaRequest("Conta A", "500.00"));

        assertThat(contaPagarRepository
                .findByAnimalIdAndOrigemAndUsuarioId(animalA.id(), OrigemContaPagar.COMPRA_ANIMAL, usuarioA.getId()))
                .isPresent()
                .get()
                .satisfies(conta -> assertThat(conta.getUsuario().getId()).isEqualTo(usuarioA.getId()));
        assertThat(animalRepository.findByIdAndUsuarioId(animalA.id(), usuarioA.getId()))
                .isPresent()
                .get()
                .satisfies(animal -> assertThat(animal.getUsuario().getId()).isEqualTo(usuarioA.getId()));

        TestSecurityUtils.autenticar(usuarioB);
        PastoResponseDTO pastoB = pastoService.criar(new PastoRequestDTO("Pasto B", new BigDecimal("10.00"), null, true));
        AnimalResponseDTO animalB = animalService.criar(criarAnimalRequest(9201L, pastoB.id(), "700.00"));
        LoteResponseDTO loteB = loteService.criar(new LoteRequestDTO("Lote B", null));
        loteService.adicionarAnimais(loteB.id(), new AdicionarAnimaisLoteRequestDTO(List.of(animalB.id())));
        ContaPagarResponseDTO contaB = contaPagarService.criar(criarContaRequest("Conta B", "900.00"));
        VendaResponseDTO vendaB = vendaService.realizarVendaLote(new VendaLoteRequestDTO(
                loteB.id(),
                "Comprador B",
                new BigDecimal("3000.00"),
                LocalDate.of(2026, 10, 9),
                new CondicaoPagamentoDTO(TipoPagamento.A_VISTA, new BigDecimal("3000.00"), null, null, null)
        ));

        assertThat(animalService.listarTodos()).extracting(AnimalResponseDTO::id).containsExactly(animalB.id());

        TestSecurityUtils.autenticar(usuarioA);

        assertThat(animalService.listarTodos()).extracting(AnimalResponseDTO::id).containsExactly(animalA.id());
        assertThatThrownBy(() -> animalService.buscarPorId(animalB.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> animalService.atualizar(animalB.id(), criarAnimalRequest(9301L, pastoA.id(), "800.00")))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> animalService.deletar(animalB.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> animalService.criar(criarAnimalRequest(9302L, pastoB.id(), "800.00")))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> animalService.alterarPasto(animalA.id(), pastoB.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> loteService.adicionarAnimais(loteA.id(), new AdicionarAnimaisLoteRequestDTO(List.of(animalB.id()))))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> vendaService.realizarVendaLote(new VendaLoteRequestDTO(
                loteB.id(),
                "Comprador indevido",
                new BigDecimal("4000.00"),
                LocalDate.of(2026, 10, 10),
                new CondicaoPagamentoDTO(TipoPagamento.A_VISTA, new BigDecimal("4000.00"), null, null, null)
        ))).isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> vendaService.buscarPorId(vendaB.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> contaPagarService.buscarPorId(contaB.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> contaPagarService.registrarPagamento(
                contaB.parcelas().getFirst().id(),
                new RegistrarPagamentoParcelaRequestDTO(LocalDate.of(2026, 10, 9), FormaPagamento.PIX)
        )).isInstanceOf(ResourceNotFoundException.class);

        assertThat(dashboardService.obterDadosDashboard().totalAnimais()).isEqualTo(1L);
        assertThat(dashboardService.obterDadosDashboard().totalVendas()).isZero();
        assertThat(financeiroService.gerarResumo().totalAnimaisCadastrados()).isEqualTo(1);
        assertThat(financeiroService.gerarResumo().totalVendasRealizadas()).isZero();
        assertThat(contaPagarService.buscarResumo().totalAPagar()).isEqualByComparingTo("1500.00");
        assertThat(contaPagarService.buscarPorId(contaA.id()).id()).isEqualTo(contaA.id());
    }

    private Usuario salvarUsuario(String email) {
        return usuarioRepository.save(TestSecurityUtils.usuario(email));
    }

    private AnimalRequestDTO criarAnimalRequest(Long codigo, Long pastoId, String valorPago) {
        return new AnimalRequestDTO(
                codigo,
                "Nelore",
                SexoAnimal.MACHO,
                new BigDecimal("420.00"),
                new BigDecimal(valorPago),
                BigDecimal.ZERO,
                "Fornecedor",
                LocalDate.of(2026, 10, 9),
                null,
                pastoId,
                TipoPagamentoContaPagar.A_VISTA,
                null,
                null,
                null,
                null
        );
    }

    private CriarContaPagarRequestDTO criarContaRequest(String descricao, String valor) {
        return new CriarContaPagarRequestDTO(
                descricao,
                CategoriaContaPagar.RACAO,
                "Fornecedor",
                new BigDecimal(valor),
                LocalDate.of(2026, 10, 9),
                TipoPagamentoContaPagar.A_VISTA,
                null,
                null,
                null,
                null,
                null
        );
    }
}
