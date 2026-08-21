package gestao.pecuaria.backend.movimentacao.service;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.AnimalService;
import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.dto.AnimalResponseDTO;
import gestao.pecuaria.backend.animal.dto.LocalizacaoAnimalDTO;
import gestao.pecuaria.backend.animal.dto.MovimentacaoAnimalResponseDTO;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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

    @Test
    void deveTrocarAnimalDePastoFechandoHistoricoAtualECriandoNovaMovimentacao() {
        Pasto pastoAtual = salvarPasto("Boa Vista 01");
        Pasto novoPasto = salvarPasto("Boa Vista 03");
        AnimalResponseDTO animalCriado = animalService.criar(criarRequest(2005L, pastoAtual.getId()));

        AnimalResponseDTO animalAtualizado = animalService.alterarPasto(animalCriado.id(), novoPasto.getId());

        assertThat(animalAtualizado.pastoId()).isEqualTo(novoPasto.getId());

        List<MovimentacaoAnimal> movimentacoes =
                movimentacaoAnimalRepository.findByAnimalIdOrderByDataEntradaDesc(animalCriado.id());

        assertThat(movimentacoes).hasSize(2);

        assertThat(movimentacoes)
                .filteredOn(movimentacao -> movimentacao.getPasto().getId().equals(pastoAtual.getId()))
                .singleElement()
                .satisfies(movimentacao -> {
                    assertThat(movimentacao.getDataEntrada()).isEqualTo(LocalDate.now());
                    assertThat(movimentacao.getDataSaida()).isEqualTo(LocalDate.now());
                });

        assertThat(movimentacoes)
                .filteredOn(movimentacao -> movimentacao.getPasto().getId().equals(novoPasto.getId()))
                .singleElement()
                .satisfies(movimentacao -> {
                    assertThat(movimentacao.getDataEntrada()).isEqualTo(LocalDate.now());
                    assertThat(movimentacao.getDataSaida()).isNull();
                });
    }

    @Test
    void naoDeveTrocarAnimalParaMesmoPasto() {
        Pasto pasto = salvarPasto("Boa Vista 06");
        AnimalResponseDTO animalCriado = animalService.criar(criarRequest(2006L, pasto.getId()));

        assertThatThrownBy(() -> animalService.alterarPasto(animalCriado.id(), pasto.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Animal já está neste pasto.");
    }

    @Test
    void deveManterSomenteUmaMovimentacaoAbertaAposTrocaDePasto() {
        Pasto pastoAtual = salvarPasto("Boa Vista 07");
        Pasto novoPasto = salvarPasto("Boa Vista 08");
        AnimalResponseDTO animalCriado = animalService.criar(criarRequest(2007L, pastoAtual.getId()));

        animalService.alterarPasto(animalCriado.id(), novoPasto.getId());

        List<MovimentacaoAnimal> movimentacoes =
                movimentacaoAnimalRepository.findByAnimalIdOrderByDataEntradaDesc(animalCriado.id());

        assertThat(movimentacoes).hasSize(2);
        assertThat(movimentacoes)
                .filteredOn(movimentacao -> movimentacao.getDataSaida() == null)
                .singleElement()
                .extracting(MovimentacaoAnimal::getPasto)
                .extracting(Pasto::getId)
                .isEqualTo(novoPasto.getId());
    }

    @Test
    void naoDeveTrocarAnimalSemPastoAtual() {
        Pasto novoPasto = salvarPasto("Boa Vista 09");
        AnimalResponseDTO animalCriado = animalService.criar(criarRequest(2008L, null));

        assertThatThrownBy(() -> animalService.alterarPasto(animalCriado.id(), novoPasto.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Animal não possui pasto atual.");
    }

    @Test
    void deveBuscarLocalizacaoAtualDoAnimalComPermanencia() {
        Pasto pasto = salvarPasto("Boa Vista 10");
        AnimalResponseDTO animalCriado = animalService.criar(criarRequest(2009L, pasto.getId()));

        LocalizacaoAnimalDTO localizacao = animalService.buscarLocalizacaoAtual(animalCriado.id());

        assertThat(localizacao.animalId()).isEqualTo(animalCriado.id());
        assertThat(localizacao.pasto()).isNotNull();
        assertThat(localizacao.pasto().id()).isEqualTo(pasto.getId());
        assertThat(localizacao.pasto().nome()).isEqualTo("Boa Vista 10");
        assertThat(localizacao.dataEntrada()).isEqualTo(LocalDate.now());
        assertThat(localizacao.diasPermanencia()).isZero();
    }

    @Test
    void deveRetornarLocalizacaoSemPastoQuandoNaoExisteMovimentacaoAberta() {
        AnimalResponseDTO animalCriado = animalService.criar(criarRequest(2010L, null));

        LocalizacaoAnimalDTO localizacao = animalService.buscarLocalizacaoAtual(animalCriado.id());

        assertThat(localizacao.animalId()).isEqualTo(animalCriado.id());
        assertThat(localizacao.pasto()).isNull();
        assertThat(localizacao.dataEntrada()).isNull();
        assertThat(localizacao.diasPermanencia()).isNull();
    }

    @Test
    void deveAtualizarLocalizacaoAtualAposTrocaDePasto() {
        Pasto pastoAtual = salvarPasto("Boa Vista 11");
        Pasto novoPasto = salvarPasto("Boa Vista 12");
        AnimalResponseDTO animalCriado = animalService.criar(criarRequest(2011L, pastoAtual.getId()));

        animalService.alterarPasto(animalCriado.id(), novoPasto.getId());

        LocalizacaoAnimalDTO localizacao = animalService.buscarLocalizacaoAtual(animalCriado.id());

        assertThat(localizacao.pasto()).isNotNull();
        assertThat(localizacao.pasto().id()).isEqualTo(novoPasto.getId());
        assertThat(localizacao.dataEntrada()).isEqualTo(LocalDate.now());
        assertThat(localizacao.diasPermanencia()).isZero();
    }

    @Test
    void deveBuscarHistoricoCompletoDeMovimentacoesDoAnimal() {
        Pasto primeiroPasto = salvarPasto("Boa Vista 13");
        Pasto segundoPasto = salvarPasto("Boa Vista 14");
        Pasto terceiroPasto = salvarPasto("Boa Vista 15");
        AnimalResponseDTO animalCriado = animalService.criar(criarRequest(2012L, primeiroPasto.getId()));

        animalService.alterarPasto(animalCriado.id(), segundoPasto.getId());
        animalService.alterarPasto(animalCriado.id(), terceiroPasto.getId());

        List<MovimentacaoAnimalResponseDTO> historico =
                animalService.buscarHistoricoMovimentacoes(animalCriado.id());

        assertThat(historico).hasSize(3);
        assertThat(historico.getFirst().pasto().id()).isEqualTo(terceiroPasto.getId());
        assertThat(historico.getFirst().atual()).isTrue();
        assertThat(historico.getFirst().dataSaida()).isNull();
        assertThat(historico)
                .filteredOn(MovimentacaoAnimalResponseDTO::atual)
                .hasSize(1);
    }

    @Test
    void deveCalcularPermanenciaComDataSaidaQuandoMovimentacaoEstaFechada() {
        Pasto pasto = salvarPasto("Boa Vista 16");
        AnimalResponseDTO animalCriado = animalService.criar(criarRequest(2013L, pasto.getId()));
        MovimentacaoAnimal movimentacao = movimentacaoAnimalRepository
                .findByAnimalIdAndDataSaidaIsNull(animalCriado.id())
                .orElseThrow();
        movimentacao.setDataEntrada(LocalDate.of(2026, 8, 1));
        movimentacao.setDataSaida(LocalDate.of(2026, 8, 20));
        movimentacaoAnimalRepository.save(movimentacao);

        List<MovimentacaoAnimalResponseDTO> historico =
                animalService.buscarHistoricoMovimentacoes(animalCriado.id());

        assertThat(historico).hasSize(1);
        assertThat(historico.getFirst().diasPermanencia()).isEqualTo(19);
        assertThat(historico.getFirst().atual()).isFalse();
    }

    @Test
    void deveRetornarHistoricoVazioQuandoAnimalNaoPossuiMovimentacoes() {
        AnimalResponseDTO animalCriado = animalService.criar(criarRequest(2014L, null));

        assertThat(animalService.buscarHistoricoMovimentacoes(animalCriado.id()))
                .isEmpty();
    }

    @Test
    void deveBuscarMovimentacoesGeraisComFiltrosEOrdenacao() {
        Pasto primeiroPasto = salvarPasto("Boa Vista 17");
        Pasto segundoPasto = salvarPasto("Boa Vista 18");
        AnimalResponseDTO primeiroAnimal = animalService.criar(criarRequest(2015L, primeiroPasto.getId()));
        AnimalResponseDTO segundoAnimal = animalService.criar(criarRequest(2016L, segundoPasto.getId()));

        MovimentacaoAnimal movimentacaoAntiga = movimentacaoAnimalRepository
                .findByAnimalIdAndDataSaidaIsNull(primeiroAnimal.id())
                .orElseThrow();
        movimentacaoAntiga.setDataEntrada(LocalDate.now().minusDays(30));
        movimentacaoAntiga.setDataSaida(LocalDate.now().minusDays(10));
        movimentacaoAnimalRepository.save(movimentacaoAntiga);

        MovimentacaoAnimal movimentacaoAtual = movimentacaoAnimalRepository
                .findByAnimalIdAndDataSaidaIsNull(segundoAnimal.id())
                .orElseThrow();
        movimentacaoAtual.setDataEntrada(LocalDate.now().minusDays(5));
        movimentacaoAnimalRepository.save(movimentacaoAtual);

        List<gestao.pecuaria.backend.movimentacao.dto.MovimentacaoAnimalResponseDTO> todas =
                movimentacaoAnimalService.buscarMovimentacoes(null, null, null, null);

        assertThat(todas)
                .extracting(movimentacao -> movimentacao.animal().codigoAnimal())
                .containsSubsequence("2016", "2015");
        assertThat(todas)
                .filteredOn(movimentacao -> movimentacao.animal().id().equals(primeiroAnimal.id()))
                .singleElement()
                .satisfies(movimentacao -> {
                    assertThat(movimentacao.pasto().id()).isEqualTo(primeiroPasto.getId());
                    assertThat(movimentacao.diasPermanencia()).isEqualTo(20);
                    assertThat(movimentacao.atual()).isFalse();
                });
        assertThat(todas)
                .filteredOn(movimentacao -> movimentacao.animal().id().equals(segundoAnimal.id()))
                .singleElement()
                .satisfies(movimentacao -> {
                    assertThat(movimentacao.pasto().id()).isEqualTo(segundoPasto.getId());
                    assertThat(movimentacao.diasPermanencia()).isEqualTo(5);
                    assertThat(movimentacao.atual()).isTrue();
                });

        assertThat(movimentacaoAnimalService.buscarMovimentacoes(primeiroAnimal.id(), null, null, null))
                .extracting(movimentacao -> movimentacao.animal().id())
                .containsExactly(primeiroAnimal.id());
        assertThat(movimentacaoAnimalService.buscarMovimentacoes(null, segundoPasto.getId(), null, null))
                .extracting(movimentacao -> movimentacao.pasto().id())
                .containsExactly(segundoPasto.getId());
        assertThat(movimentacaoAnimalService.buscarMovimentacoes(null, null, LocalDate.now().minusDays(7), LocalDate.now()))
                .extracting(movimentacao -> movimentacao.animal().id())
                .containsExactly(segundoAnimal.id());
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
