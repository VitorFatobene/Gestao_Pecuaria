package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.TestSecurityUtils;
import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.dto.AnimalResponseDTO;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.contapagar.enums.CategoriaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.OrigemContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;
import gestao.pecuaria.backend.contapagar.repository.ContaPagarRepository;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AnimalServiceIntegrationTest {

    @Autowired
    private AnimalService animalService;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private ContaPagarRepository contaPagarRepository;

    @Autowired
    private PastoRepository pastoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario usuario;

    @BeforeEach
    void configurarUsuario() {
        usuario = usuarioRepository.save(TestSecurityUtils.usuario("animal-integracao-" + System.nanoTime() + "@teste.com"));
        TestSecurityUtils.autenticar(usuario);
    }

    @AfterEach
    void limparAutenticacao() {
        TestSecurityUtils.limparAutenticacao();
    }

    @Test
    void deveCriarAnimalAVistaComContaPagarVinculada() {
        AnimalResponseDTO animal = animalService.criar(criarRequest(
                901L,
                TipoPagamentoContaPagar.A_VISTA,
                null,
                null,
                null,
                null
        ));

        var conta = contaPagarRepository
                .findByAnimalIdAndOrigemAndUsuarioId(animal.id(), OrigemContaPagar.COMPRA_ANIMAL, usuario.getId())
                .orElseThrow();

        assertThat(conta.getCategoria()).isEqualTo(CategoriaContaPagar.ANIMAL);
        assertThat(conta.getFornecedor()).isEqualTo("Fazenda Santa Luzia");
        assertThat(conta.getValorTotal()).isEqualByComparingTo("9000.00");
        assertThat(conta.getParcelas()).singleElement().satisfies(parcela -> {
            assertThat(parcela.getStatus()).isEqualTo(StatusParcelaContaPagar.PENDENTE);
            assertThat(parcela.getDataVencimento()).isEqualTo(LocalDate.of(2026, 10, 6));
        });
    }

    @Test
    void deveCriarAnimalAPrazoComUmaParcela() {
        AnimalResponseDTO animal = animalService.criar(criarRequest(
                902L,
                TipoPagamentoContaPagar.PRAZO,
                LocalDate.of(2027, 1, 4),
                null,
                null,
                null
        ));

        var conta = contaPagarRepository
                .findByAnimalIdAndOrigemAndUsuarioId(animal.id(), OrigemContaPagar.COMPRA_ANIMAL, usuario.getId())
                .orElseThrow();

        assertThat(conta.getTipoPagamento()).isEqualTo(TipoPagamentoContaPagar.PRAZO);
        assertThat(conta.getParcelas()).singleElement().satisfies(parcela ->
                assertThat(parcela.getDataVencimento()).isEqualTo(LocalDate.of(2027, 1, 4))
        );
    }

    @Test
    void deveCriarAnimalParceladoComQuantidadeDeParcelas() {
        AnimalResponseDTO animal = animalService.criar(criarRequest(
                903L,
                TipoPagamentoContaPagar.PARCELADO,
                null,
                3,
                LocalDate.of(2026, 11, 6),
                30
        ));

        var conta = contaPagarRepository
                .findByAnimalIdAndOrigemAndUsuarioId(animal.id(), OrigemContaPagar.COMPRA_ANIMAL, usuario.getId())
                .orElseThrow();

        assertThat(conta.getParcelas()).hasSize(3);
        assertThat(conta.getParcelas()).extracting("valor")
                .containsExactly(new BigDecimal("3000.00"), new BigDecimal("3000.00"), new BigDecimal("3000.00"));
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void deveFazerRollbackDoAnimalQuandoContaPagarFalhar() {
        long totalAntes = animalRepository.count();

        assertThatThrownBy(() -> animalService.criar(criarRequest(
                904L,
                TipoPagamentoContaPagar.PRAZO,
                LocalDate.of(2026, 10, 5),
                null,
                null,
                null
        )))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A data de vencimento não pode ser anterior à data da compra.");

        assertThat(animalRepository.count()).isEqualTo(totalAntes);
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 19, 20, 21, 40, 41})
    void devePaginarAnimaisComVinteItensPorPagina(int quantidadeAnimais) {
        salvarAnimaisDireto(quantidadeAnimais, usuario, salvarPasto("Pasto paginado"), "Nelore", StatusAnimal.ATIVO, 10_000L);

        var primeiraPagina = animalService.listarPaginado(0, 20, null, null, null, null);

        assertThat(primeiraPagina.totalElements()).isEqualTo(quantidadeAnimais);
        assertThat(primeiraPagina.totalPages()).isEqualTo((int) Math.ceil(quantidadeAnimais / 20.0));
        assertThat(primeiraPagina.page()).isZero();
        assertThat(primeiraPagina.size()).isEqualTo(20);
        assertThat(primeiraPagina.content()).hasSize(Math.min(quantidadeAnimais, 20));
        assertThat(primeiraPagina.first()).isTrue();
        assertThat(primeiraPagina.last()).isEqualTo(quantidadeAnimais <= 20);

        if (quantidadeAnimais > 20) {
            var segundaPagina = animalService.listarPaginado(1, 20, null, null, null, null);
            assertThat(segundaPagina.content()).hasSize(Math.min(quantidadeAnimais - 20, 20));
            assertThat(segundaPagina.totalElements()).isEqualTo(quantidadeAnimais);
        }
    }

    @Test
    void deveAplicarFiltrosAntesDaPaginacao() {
        Pasto pastoA = salvarPasto("Pasto filtro A");
        Pasto pastoB = salvarPasto("Pasto filtro B");
        salvarAnimaisDireto(25, usuario, pastoA, "Nelore", StatusAnimal.ATIVO, 20_000L);
        salvarAnimaisDireto(5, usuario, pastoB, "Angus", StatusAnimal.ATIVO, 30_000L);
        salvarAnimaisDireto(3, usuario, pastoA, "Nelore", StatusAnimal.INATIVO, 40_000L);

        var pagina = animalService.listarPaginado(0, 20, "nel", pastoA.getId(), StatusAnimal.ATIVO, "Nelore");

        assertThat(pagina.totalElements()).isEqualTo(25);
        assertThat(pagina.totalPages()).isEqualTo(2);
        assertThat(pagina.content()).hasSize(20);
        assertThat(pagina.content()).allSatisfy(animal -> {
            assertThat(animal.raca()).isEqualTo("Nelore");
            assertThat(animal.status()).isEqualTo(StatusAnimal.ATIVO);
            assertThat(animal.pastoId()).isEqualTo(pastoA.getId());
        });
    }

    @Test
    void devePaginarCadaStatusSemMisturarResultados() {
        Pasto pasto = salvarPasto("Pasto status paginado");
        salvarAnimaisDireto(45, usuario, pasto, "Nelore", StatusAnimal.ATIVO, 45_000L);
        salvarAnimaisDireto(30, usuario, pasto, "Nelore", StatusAnimal.VENDIDO, 46_000L);
        salvarAnimaisDireto(2, usuario, pasto, "Nelore", StatusAnimal.INATIVO, 47_000L);

        var primeiraPaginaAtivos = animalService.listarPaginado(0, 20, null, null, StatusAnimal.ATIVO, null);
        var segundaPaginaAtivos = animalService.listarPaginado(1, 20, null, null, StatusAnimal.ATIVO, null);
        var terceiraPaginaAtivos = animalService.listarPaginado(2, 20, null, null, StatusAnimal.ATIVO, null);
        var vendidos = animalService.listarPaginado(0, 20, null, null, StatusAnimal.VENDIDO, null);
        var inativos = animalService.listarPaginado(0, 20, null, null, StatusAnimal.INATIVO, null);
        var todos = animalService.listarPaginado(0, 100, null, null, null, null);

        assertThat(primeiraPaginaAtivos.totalElements()).isEqualTo(45);
        assertThat(primeiraPaginaAtivos.totalPages()).isEqualTo(3);
        assertThat(primeiraPaginaAtivos.content()).hasSize(20).allSatisfy(animal ->
                assertThat(animal.status()).isEqualTo(StatusAnimal.ATIVO)
        );
        assertThat(segundaPaginaAtivos.content()).hasSize(20);
        assertThat(terceiraPaginaAtivos.content()).hasSize(5);
        assertThat(vendidos.totalElements()).isEqualTo(30);
        assertThat(vendidos.content()).hasSize(20).allSatisfy(animal ->
                assertThat(animal.status()).isEqualTo(StatusAnimal.VENDIDO)
        );
        assertThat(inativos.totalElements()).isEqualTo(2);
        assertThat(inativos.content()).hasSize(2).allSatisfy(animal ->
                assertThat(animal.status()).isEqualTo(StatusAnimal.INATIVO)
        );
        assertThat(todos.totalElements()).isEqualTo(77);
    }

    @Test
    void deveOrdenarPaginacaoPorCodigoAnimalEId() {
        Pasto pasto = salvarPasto("Pasto ordenacao");
        salvarAnimalDireto(usuario, pasto, 50_300L, "Nelore", StatusAnimal.ATIVO);
        salvarAnimalDireto(usuario, pasto, 50_100L, "Nelore", StatusAnimal.ATIVO);
        salvarAnimalDireto(usuario, pasto, 50_200L, "Nelore", StatusAnimal.ATIVO);

        var pagina = animalService.listarPaginado(0, 20, null, null, null, null);

        assertThat(pagina.content()).extracting(AnimalResponseDTO::codigoAnimal)
                .containsExactly(50_100L, 50_200L, 50_300L);
    }

    @Test
    void devePaginarApenasAnimaisDoUsuarioAutenticado() {
        Usuario outroUsuario = usuarioRepository.save(TestSecurityUtils.usuario("animal-outro-" + System.nanoTime() + "@teste.com"));
        salvarAnimalDireto(usuario, salvarPasto("Pasto usuario autenticado"), 60_100L, "Nelore", StatusAnimal.ATIVO);
        salvarAnimalDireto(outroUsuario, salvarPasto(outroUsuario, "Pasto outro usuario"), 60_200L, "Angus", StatusAnimal.ATIVO);

        TestSecurityUtils.autenticar(usuario);
        var paginaUsuario = animalService.listarPaginado(0, 20, null, null, null, null);

        assertThat(paginaUsuario.totalElements()).isEqualTo(1);
        assertThat(paginaUsuario.content()).extracting(AnimalResponseDTO::codigoAnimal).containsExactly(60_100L);

        TestSecurityUtils.autenticar(outroUsuario);
        var paginaOutroUsuario = animalService.listarPaginado(0, 20, null, null, null, null);

        assertThat(paginaOutroUsuario.totalElements()).isEqualTo(1);
        assertThat(paginaOutroUsuario.content()).extracting(AnimalResponseDTO::codigoAnimal).containsExactly(60_200L);
    }

    @Test
    void deveListarRacasDoUsuarioAutenticado() {
        Usuario outroUsuario = usuarioRepository.save(TestSecurityUtils.usuario("animal-racas-outro-" + System.nanoTime() + "@teste.com"));
        salvarAnimalDireto(usuario, salvarPasto("Pasto racas"), 70_100L, "Nelore", StatusAnimal.ATIVO);
        salvarAnimalDireto(usuario, salvarPasto("Pasto racas 2"), 70_200L, "Angus", StatusAnimal.ATIVO);
        salvarAnimalDireto(outroUsuario, salvarPasto(outroUsuario, "Pasto racas outro"), 70_300L, "Brahman", StatusAnimal.ATIVO);

        assertThat(animalService.listarRacas()).containsExactly("Angus", "Nelore");
    }

    private AnimalRequestDTO criarRequest(
            Long codigoAnimal,
            TipoPagamentoContaPagar tipoPagamento,
            LocalDate dataVencimento,
            Integer quantidadeParcelas,
            LocalDate primeiroVencimento,
            Integer intervaloDias
    ) {
        Pasto pasto = salvarPasto();
        return new AnimalRequestDTO(
                codigoAnimal,
                "Nelore",
                SexoAnimal.MACHO,
                new BigDecimal("420.00"),
                new BigDecimal("9000.00"),
                BigDecimal.ZERO,
                "Fazenda Santa Luzia",
                LocalDate.of(2026, 10, 6),
                null,
                pasto.getId(),
                tipoPagamento,
                dataVencimento,
                quantidadeParcelas,
                primeiroVencimento,
                intervaloDias
        );
    }

    private Pasto salvarPasto() {
        return salvarPasto("Pasto Teste " + System.nanoTime());
    }

    private Pasto salvarPasto(String nome) {
        return salvarPasto(usuario, nome);
    }

    private Pasto salvarPasto(Usuario dono, String nome) {
        Pasto pasto = new Pasto();
        pasto.setNome(nome + " " + System.nanoTime());
        pasto.setAreaHectares(new BigDecimal("12.50"));
        pasto.setAtivo(true);
        pasto.setUsuario(dono);
        return pastoRepository.save(pasto);
    }

    private List<Animal> salvarAnimaisDireto(
            int quantidade,
            Usuario dono,
            Pasto pasto,
            String raca,
            StatusAnimal status,
            long codigoInicial
    ) {
        return java.util.stream.LongStream.range(0, quantidade)
                .mapToObj(index -> salvarAnimalDireto(dono, pasto, codigoInicial + index, raca, status))
                .toList();
    }

    private Animal salvarAnimalDireto(Usuario dono, Pasto pasto, Long codigoAnimal, String raca, StatusAnimal status) {
        Animal animal = new Animal();
        animal.setCodigoAnimal(codigoAnimal);
        animal.setRaca(raca);
        animal.setSexo(SexoAnimal.MACHO);
        animal.setPesoKg(new BigDecimal("420.00"));
        animal.setValorPago(new BigDecimal("9000.00"));
        animal.setValorFrete(BigDecimal.ZERO);
        animal.setNomeVendedor("Fazenda Santa Luzia");
        animal.setDataCompra(LocalDate.of(2026, 10, 6));
        animal.setStatus(status);
        animal.setUsuario(dono);
        animal.setPasto(pasto);
        return animalRepository.save(animal);
    }
}
