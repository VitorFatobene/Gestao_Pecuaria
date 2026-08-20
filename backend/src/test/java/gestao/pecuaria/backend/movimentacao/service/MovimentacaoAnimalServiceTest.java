package gestao.pecuaria.backend.movimentacao.service;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.AnimalService;
import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.dto.AnimalResponseDTO;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import gestao.pecuaria.backend.movimentacao.repository.MovimentacaoAnimalRepository;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class MovimentacaoAnimalServiceTest {

    @Autowired
    private AnimalService animalService;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private PastoRepository pastoRepository;

    @Autowired
    private MovimentacaoAnimalRepository movimentacaoAnimalRepository;

    @Autowired
    private MovimentacaoAnimalService movimentacaoAnimalService;

    @Test
    void deveCriarMovimentacaoInicialAoCadastrarAnimalComPasto() {
        Pasto pasto = salvarPasto("Boa Vista 03");

        AnimalResponseDTO response = animalService.criar(criarRequest(2001L, pasto.getId()));

        List<MovimentacaoAnimal> movimentacoes =
                movimentacaoAnimalRepository.findByAnimalIdOrderByDataEntradaDesc(response.id());

        assertThat(movimentacoes).hasSize(1);
        assertThat(movimentacoes.getFirst().getPasto().getId()).isEqualTo(pasto.getId());
        assertThat(movimentacoes.getFirst().getDataEntrada()).isEqualTo(LocalDate.now());
        assertThat(movimentacoes.getFirst().getDataSaida()).isNull();
    }

    @Test
    void naoDeveCriarMovimentacaoAoCadastrarAnimalSemPasto() {
        AnimalResponseDTO response = animalService.criar(criarRequest(2002L, null));

        assertThat(movimentacaoAnimalRepository.findByAnimalIdOrderByDataEntradaDesc(response.id()))
                .isEmpty();
    }

    @Test
    void devePermitirConsultarHistoricoInicialDoAnimal() {
        Pasto pasto = salvarPasto("Boa Vista 04");

        AnimalResponseDTO response = animalService.criar(criarRequest(2003L, pasto.getId()));

        assertThat(movimentacaoAnimalRepository.findByAnimalIdAndDataSaidaIsNull(response.id()))
                .isPresent()
                .get()
                .satisfies(movimentacao -> {
                    assertThat(movimentacao.getAnimal().getId()).isEqualTo(response.id());
                    assertThat(movimentacao.getPasto().getId()).isEqualTo(pasto.getId());
                });
    }

    @Test
    void naoDeveDuplicarMovimentacaoAbertaDoAnimal() {
        Pasto pasto = salvarPasto("Boa Vista 05");
        AnimalResponseDTO response = animalService.criar(criarRequest(2004L, pasto.getId()));
        Animal animal = animalRepository.findById(response.id()).orElseThrow();

        movimentacaoAnimalService.registrarEntrada(animal, pasto);

        assertThat(movimentacaoAnimalRepository.findByAnimalIdOrderByDataEntradaDesc(response.id()))
                .hasSize(1);
    }

    private Pasto salvarPasto(String nome) {
        Pasto pasto = new Pasto();
        pasto.setNome(nome);
        pasto.setAreaHectares(new BigDecimal("12.50"));
        pasto.setAtivo(true);

        return pastoRepository.save(pasto);
    }

    private AnimalRequestDTO criarRequest(Long codigoAnimal, Long pastoId) {
        return new AnimalRequestDTO(
                codigoAnimal,
                "Nelore",
                SexoAnimal.MACHO,
                new BigDecimal("420.00"),
                new BigDecimal("3500.00"),
                BigDecimal.ZERO,
                "Fazenda Santa Luzia",
                LocalDate.of(2026, 8, 1),
                null,
                pastoId
        );
    }
}
