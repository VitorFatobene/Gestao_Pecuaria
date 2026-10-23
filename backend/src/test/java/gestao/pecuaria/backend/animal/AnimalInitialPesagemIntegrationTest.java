package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.TestSecurityUtils;
import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;
import gestao.pecuaria.backend.pesagem.PesagemAnimalRepository;
import gestao.pecuaria.backend.pesagem.PesagemAnimalService;
import gestao.pecuaria.backend.pesagem.dto.PesagemAnimalRequestDTO;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class AnimalInitialPesagemIntegrationTest {

    @Autowired private AnimalService animalService;
    @Autowired private AnimalRepository animalRepository;
    @Autowired private PesagemAnimalService pesagemAnimalService;
    @Autowired private PesagemAnimalRepository pesagemAnimalRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    private Usuario usuario;

    @BeforeEach
    void configurarUsuario() {
        usuario = usuarioRepository.save(TestSecurityUtils.usuario("peso-inicial-" + System.nanoTime() + "@teste.com"));
        TestSecurityUtils.autenticar(usuario);
    }

    @AfterEach
    void limparAutenticacao() {
        TestSecurityUtils.limparAutenticacao();
    }

    @Test
    void deveCriarPesagemInicialQuandoAnimalPossuiPeso() {
        var animal = animalService.criar(request(8101L, new BigDecimal("300.00")));

        assertThat(animal.pesoKg()).isEqualByComparingTo("300.00");
        assertThat(pesagemAnimalRepository.findByAnimalIdAndAnimalUsuarioIdOrderByDataPesagemDescIdDesc(animal.id(), usuario.getId()))
                .singleElement()
                .satisfies(pesagem -> {
                    assertThat(pesagem.getPesoKg()).isEqualByComparingTo("300.00");
                    assertThat(pesagem.getDataPesagem()).isEqualTo(LocalDate.of(2026, 10, 15));
                    assertThat(pesagem.getObservacao()).isEqualTo("Peso inicial");
                });
    }

    @Test
    void naoDeveCriarPesagemInicialQuandoAnimalNaoPossuiPeso() {
        var animal = animalService.criar(request(8102L, null));

        assertThat(animal.pesoKg()).isNull();
        assertThat(pesagemAnimalRepository.existsByAnimalId(animal.id())).isFalse();
    }

    @Test
    void deveManterPesoInicialAoRegistrarNovasPesagens() {
        var animal = animalService.criar(request(8103L, new BigDecimal("300.00")));

        pesagemAnimalService.registrar(animal.id(), new PesagemAnimalRequestDTO(
                new BigDecimal("330.00"), LocalDate.of(2026, 10, 20), null));
        pesagemAnimalService.registrar(animal.id(), new PesagemAnimalRequestDTO(
                new BigDecimal("350.00"), LocalDate.of(2026, 10, 22), null));

        assertThat(animalRepository.findById(animal.id()).orElseThrow().getPesoKg()).isEqualByComparingTo("350.00");
        assertThat(pesagemAnimalRepository.findByAnimalIdAndAnimalUsuarioIdOrderByDataPesagemDescIdDesc(animal.id(), usuario.getId()))
                .extracting(pesagem -> pesagem.getPesoKg().stripTrailingZeros())
                .containsExactly(new BigDecimal("350"), new BigDecimal("330"), new BigDecimal("300"));
    }

    private AnimalRequestDTO request(Long codigo, BigDecimal pesoKg) {
        return new AnimalRequestDTO(
                codigo, "Nelore", SexoAnimal.MACHO, pesoKg,
                new BigDecimal("3000.00"), BigDecimal.ZERO, "Fazenda Teste",
                LocalDate.of(2026, 10, 15), null, null,
                TipoPagamentoContaPagar.A_VISTA, null, null, null, null
        );
    }
}
