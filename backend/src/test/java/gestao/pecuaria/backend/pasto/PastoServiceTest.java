package gestao.pecuaria.backend.pasto;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import gestao.pecuaria.backend.movimentacao.repository.MovimentacaoAnimalRepository;
import gestao.pecuaria.backend.pasto.dto.AnimalNoPastoDTO;
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
class PastoServiceTest {

    @Autowired
    private PastoService pastoService;

    @Autowired
    private PastoRepository pastoRepository;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private MovimentacaoAnimalRepository movimentacaoAnimalRepository;

    @Test
    void deveBuscarSomenteAnimaisAtuaisDoPastoOrdenadosPorMaiorPermanencia() {
        Pasto pastoOrigem = salvarPasto("Boa Vista 20");
        Pasto outroPasto = salvarPasto("Boa Vista 21");
        Animal animalMaisAntigo = salvarAnimal(3020L, pastoOrigem, new BigDecimal("520.00"));
        Animal animalMaisRecente = salvarAnimal(3021L, pastoOrigem, new BigDecimal("480.00"));
        Animal animalMovido = salvarAnimal(3022L, outroPasto, new BigDecimal("500.00"));

        salvarMovimentacao(animalMaisAntigo, pastoOrigem, LocalDate.now().minusDays(30), null);
        salvarMovimentacao(animalMaisRecente, pastoOrigem, LocalDate.now().minusDays(15), null);
        salvarMovimentacao(animalMovido, pastoOrigem, LocalDate.now().minusDays(45), LocalDate.now().minusDays(1));
        salvarMovimentacao(animalMovido, outroPasto, LocalDate.now().minusDays(1), null);

        List<AnimalNoPastoDTO> animais = pastoService.buscarAnimaisAtuaisDoPasto(pastoOrigem.getId());

        assertThat(animais)
                .extracting(AnimalNoPastoDTO::codigoAnimal)
                .containsExactly("3020", "3021");
        assertThat(animais)
                .extracting(AnimalNoPastoDTO::diasNoPasto)
                .containsExactly(30, 15);
        assertThat(animais.getFirst().dataEntrada()).isEqualTo(LocalDate.now().minusDays(30));
        assertThat(animais.getFirst().raca()).isEqualTo("Nelore");
        assertThat(animais.getFirst().pesoKg()).isEqualByComparingTo(new BigDecimal("520.00"));
    }

    private Pasto salvarPasto(String nome) {
        Pasto pasto = new Pasto();
        pasto.setNome(nome);
        pasto.setAreaHectares(new BigDecimal("12.50"));
        pasto.setAtivo(true);

        return pastoRepository.save(pasto);
    }

    private Animal salvarAnimal(Long codigoAnimal, Pasto pasto, BigDecimal pesoKg) {
        Animal animal = new Animal();
        animal.setCodigoAnimal(codigoAnimal);
        animal.setRaca("Nelore");
        animal.setSexo(SexoAnimal.MACHO);
        animal.setPesoKg(pesoKg);
        animal.setValorPago(new BigDecimal("3500.00"));
        animal.setValorFrete(BigDecimal.ZERO);
        animal.setDataCompra(LocalDate.of(2026, 8, 1));
        animal.setStatus(StatusAnimal.ATIVO);
        animal.setPasto(pasto);

        return animalRepository.save(animal);
    }

    private void salvarMovimentacao(Animal animal, Pasto pasto, LocalDate dataEntrada, LocalDate dataSaida) {
        MovimentacaoAnimal movimentacao = new MovimentacaoAnimal();
        movimentacao.setAnimal(animal);
        movimentacao.setPasto(pasto);
        movimentacao.setDataEntrada(dataEntrada);
        movimentacao.setDataSaida(dataSaida);

        movimentacaoAnimalRepository.save(movimentacao);
    }
}
