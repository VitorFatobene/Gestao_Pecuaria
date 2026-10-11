package gestao.pecuaria.backend.compra;

import gestao.pecuaria.backend.TestSecurityUtils;
import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class CompraEntityIntegrationTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private AnimalRepository animalRepository;

    @Test
    void devePermitirAnimalSemCompra() {
        Usuario usuario = usuarioRepository.save(TestSecurityUtils.usuario("animal-sem-compra-" + System.nanoTime() + "@teste.com"));

        Animal animal = animal(9501L, usuario);
        Animal animalSalvo = animalRepository.saveAndFlush(animal);

        assertThat(animalSalvo.getCompra()).isNull();
        assertThat(animalRepository.findByIdAndUsuarioId(animalSalvo.getId(), usuario.getId()))
                .isPresent()
                .get()
                .satisfies(animalPersistido -> assertThat(animalPersistido.getCompra()).isNull());
    }

    @Test
    void devePersistirVinculoEntreCompraEAnimal() {
        Usuario usuario = usuarioRepository.save(TestSecurityUtils.usuario("compra-animal-" + System.nanoTime() + "@teste.com"));
        Compra compra = compra(usuario);
        Compra compraSalva = compraRepository.saveAndFlush(compra);

        Animal animal = animal(9502L, usuario);
        animal.setCompra(compraSalva);
        Animal animalSalvo = animalRepository.saveAndFlush(animal);

        assertThat(animalSalvo.getCompra()).isNotNull();
        assertThat(animalSalvo.getCompra().getId()).isEqualTo(compraSalva.getId());
        assertThat(animalRepository.findByCompraIdAndUsuarioId(compraSalva.getId(), usuario.getId()))
                .singleElement()
                .satisfies(animalPersistido -> assertThat(animalPersistido.getId()).isEqualTo(animalSalvo.getId()));
    }

    private Compra compra(Usuario usuario) {
        Compra compra = new Compra();
        compra.setUsuario(usuario);
        compra.setFornecedor("Fazenda Santa Luzia");
        compra.setDataCompra(LocalDate.of(2026, 10, 6));
        compra.setValorTotal(new BigDecimal("18000.00"));
        compra.setObservacao("Negociacao inicial.");
        return compra;
    }

    private Animal animal(Long codigoAnimal, Usuario usuario) {
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
}
