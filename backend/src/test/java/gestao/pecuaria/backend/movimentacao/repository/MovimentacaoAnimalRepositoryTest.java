package gestao.pecuaria.backend.movimentacao.repository;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class MovimentacaoAnimalRepositoryTest {

    @Autowired
    private MovimentacaoAnimalRepository movimentacaoAnimalRepository;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private PastoRepository pastoRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void deveCarregarHistoricoPorAnimalEPasto() {
        Pasto pasto = new Pasto();
        pasto.setNome("Boa Vista 01");
        pasto.setAreaHectares(new BigDecimal("12.50"));
        pasto.setAtivo(true);
        pasto = pastoRepository.save(pasto);

        Animal animal = new Animal();
        animal.setCodigoAnimal(1023L);
        animal.setRaca("Nelore");
        animal.setSexo(SexoAnimal.MACHO);
        animal.setPesoKg(new BigDecimal("420.00"));
        animal.setValorPago(new BigDecimal("3500.00"));
        animal.setValorFrete(BigDecimal.ZERO);
        animal.setDataCompra(LocalDate.of(2026, 8, 1));
        animal.setStatus(StatusAnimal.ATIVO);
        animal.setPasto(pasto);
        animal = animalRepository.save(animal);

        MovimentacaoAnimal movimentacao = new MovimentacaoAnimal();
        movimentacao.setAnimal(animal);
        movimentacao.setPasto(pasto);
        movimentacao.setDataEntrada(LocalDate.of(2026, 8, 1));
        movimentacao.setObservacao("Entrada inicial manual para teste");
        movimentacaoAnimalRepository.save(movimentacao);

        entityManager.flush();
        entityManager.clear();

        assertThat(movimentacaoAnimalRepository.findByAnimalIdOrderByDataEntradaDesc(animal.getId()))
                .hasSize(1)
                .first()
                .extracting(MovimentacaoAnimal::getPasto)
                .extracting(Pasto::getNome)
                .isEqualTo("Boa Vista 01");

        assertThat(movimentacaoAnimalRepository.findByAnimalIdAndDataSaidaIsNull(animal.getId()))
                .isPresent();

        assertThat(movimentacaoAnimalRepository.findByPastoIdOrderByDataEntradaDesc(pasto.getId()))
                .hasSize(1)
                .first()
                .extracting(MovimentacaoAnimal::getAnimal)
                .extracting(Animal::getCodigoAnimal)
                .isEqualTo(1023L);

        assertThat(animalRepository.findById(animal.getId()))
                .isPresent()
                .get()
                .extracting(Animal::getMovimentacoes)
                .satisfies(movimentacoes -> assertThat(movimentacoes).hasSize(1));

        assertThat(pastoRepository.findById(pasto.getId()))
                .isPresent()
                .get()
                .extracting(Pasto::getMovimentacoes)
                .satisfies(movimentacoes -> assertThat(movimentacoes).hasSize(1));
    }
}
