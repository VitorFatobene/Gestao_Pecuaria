package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.TestSecurityUtils;
import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.dto.AnimalResponseDTO;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

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
        Pasto pasto = new Pasto();
        pasto.setNome("Pasto Teste " + System.nanoTime());
        pasto.setAreaHectares(new BigDecimal("12.50"));
        pasto.setAtivo(true);
        pasto.setUsuario(usuario);
        return pastoRepository.save(pasto);
    }
}
