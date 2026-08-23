package gestao.pecuaria.backend.pesagem;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.pesagem.dto.PesagemAnimalRequestDTO;
import gestao.pecuaria.backend.pesagem.dto.PesagemAnimalResponseDTO;
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
class PesagemAnimalServiceTest {

    @Autowired
    private PesagemAnimalService pesagemAnimalService;

    @Autowired
    private PesagemAnimalRepository pesagemAnimalRepository;

    @Autowired
    private AnimalRepository animalRepository;

    @Test
    void deveRegistrarPesagemEAtualizarPesoAtualDoAnimal() {
        Animal animal = salvarAnimal(7001L, new BigDecimal("452.00"));

        PesagemAnimalResponseDTO response = pesagemAnimalService.registrar(
                animal.getId(),
                new PesagemAnimalRequestDTO(new BigDecimal("485.50"), LocalDate.now(), " Pesagem periódica ")
        );

        Animal animalAtualizado = animalRepository.findById(animal.getId()).orElseThrow();

        assertThat(response.id()).isNotNull();
        assertThat(response.pesoKg()).isEqualByComparingTo("485.50");
        assertThat(response.observacao()).isEqualTo("Pesagem periódica");
        assertThat(animalAtualizado.getPesoKg()).isEqualByComparingTo("485.50");
        assertThat(pesagemAnimalRepository.findByAnimalIdOrderByDataPesagemDescIdDesc(animal.getId())).hasSize(1);
    }

    @Test
    void deveListarHistoricoOrdenadoPorDataMaisRecente() {
        Animal animal = salvarAnimal(7002L, new BigDecimal("430.00"));

        pesagemAnimalService.registrar(
                animal.getId(),
                new PesagemAnimalRequestDTO(new BigDecimal("440.00"), LocalDate.of(2026, 8, 10), null)
        );
        pesagemAnimalService.registrar(
                animal.getId(),
                new PesagemAnimalRequestDTO(new BigDecimal("455.00"), LocalDate.of(2026, 8, 20), null)
        );

        List<PesagemAnimalResponseDTO> historico = pesagemAnimalService.listarHistorico(animal.getId());

        assertThat(historico).hasSize(2);
        assertThat(historico.getFirst().pesoKg()).isEqualByComparingTo("455.00");
        assertThat(historico.getFirst().dataPesagem()).isEqualTo(LocalDate.of(2026, 8, 20));
    }

    @Test
    void naoDeveAceitarDataFutura() {
        Animal animal = salvarAnimal(7003L, new BigDecimal("430.00"));

        assertThatThrownBy(() -> pesagemAnimalService.registrar(
                animal.getId(),
                new PesagemAnimalRequestDTO(new BigDecimal("440.00"), LocalDate.now().plusDays(1), null)
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A data da pesagem não pode ser futura.");
    }

    private Animal salvarAnimal(Long codigoAnimal, BigDecimal pesoKg) {
        Animal animal = new Animal();
        animal.setCodigoAnimal(codigoAnimal);
        animal.setRaca("Nelore");
        animal.setSexo(SexoAnimal.MACHO);
        animal.setPesoKg(pesoKg);
        animal.setValorPago(new BigDecimal("3000.00"));
        animal.setValorFrete(BigDecimal.ZERO);
        animal.setNomeVendedor("Fazenda Teste");
        animal.setDataCompra(LocalDate.of(2026, 1, 10));
        animal.setStatus(StatusAnimal.ATIVO);

        return animalRepository.save(animal);
    }
}
