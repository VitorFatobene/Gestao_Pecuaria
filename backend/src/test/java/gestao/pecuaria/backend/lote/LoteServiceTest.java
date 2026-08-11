package gestao.pecuaria.backend.lote;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.lote.dto.AdicionarAnimaisLoteRequestDTO;
import gestao.pecuaria.backend.lote.dto.LoteRequestDTO;
import gestao.pecuaria.backend.lote.dto.LoteResponseDTO;
import gestao.pecuaria.backend.lote.enums.StatusLote;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoteServiceTest {

    @Mock
    private LoteRepository loteRepository;

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private LoteService loteService;

    @Test
    void deveCriarLoteComStatusAbertoESemAnimais() {
        LoteRequestDTO request = new LoteRequestDTO("Lote Nelore Setembro", "Animais para avaliacao futura.");

        when(loteRepository.saveAndFlush(org.mockito.ArgumentMatchers.any(Lote.class))).thenAnswer(invocation -> {
            Lote lote = invocation.getArgument(0);
            lote.setId(1L);
            lote.setCriadoEm(LocalDateTime.of(2026, 8, 11, 9, 30));
            return lote;
        });
        when(animalRepository.findByLoteId(1L)).thenReturn(List.of());

        LoteResponseDTO response = loteService.criar(request);

        ArgumentCaptor<Lote> captor = ArgumentCaptor.forClass(Lote.class);
        verify(loteRepository).saveAndFlush(captor.capture());
        verify(entityManager).refresh(captor.getValue());

        assertThat(captor.getValue().getStatus()).isEqualTo(StatusLote.ABERTO);
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.nome()).isEqualTo("Lote Nelore Setembro");
        assertThat(response.status()).isEqualTo(StatusLote.ABERTO);
        assertThat(response.quantidadeAnimais()).isZero();
        assertThat(response.pesoTotalKg()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void deveListarLotesFiltradosPorStatus() {
        Lote lote = lote(1L, StatusLote.ABERTO);

        when(loteRepository.findByStatus(StatusLote.ABERTO)).thenReturn(List.of(lote));
        Animal animal1 = animal(10L, StatusAnimal.ATIVO);
        Animal animal2 = animal(11L, StatusAnimal.ATIVO);
        when(animalRepository.findByLoteId(1L)).thenReturn(List.of(animal1, animal2));

        List<LoteResponseDTO> response = loteService.listarTodos(StatusLote.ABERTO);

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().status()).isEqualTo(StatusLote.ABERTO);
        assertThat(response.getFirst().quantidadeAnimais()).isEqualTo(2L);
        assertThat(response.getFirst().pesoTotalKg()).isEqualByComparingTo("900.00");
    }

    @Test
    void deveCancelarLote() {
        Lote lote = lote(1L, StatusLote.ABERTO);

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(loteRepository.save(lote)).thenReturn(lote);
        when(animalRepository.findByLoteId(1L)).thenReturn(List.of());

        LoteResponseDTO response = loteService.cancelar(1L);

        assertThat(lote.getStatus()).isEqualTo(StatusLote.CANCELADO);
        assertThat(response.status()).isEqualTo(StatusLote.CANCELADO);
    }

    @Test
    void deveFalharAoExcluirLoteComAnimaisAssociados() {
        Lote lote = lote(1L, StatusLote.ABERTO);

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(animalRepository.existsByLoteId(1L)).thenReturn(true);

        assertThatThrownBy(() -> loteService.excluir(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Nao e possivel excluir um lote que possui animais associados.");

        verify(loteRepository, never()).delete(lote);
    }

    @Test
    void deveAdicionarAnimaisAtivosEDisponiveisAoLoteAberto() {
        Lote lote = lote(1L, StatusLote.ABERTO);
        Animal animal1 = animal(10L, StatusAnimal.ATIVO);
        Animal animal2 = animal(11L, StatusAnimal.ATIVO);
        AdicionarAnimaisLoteRequestDTO request = new AdicionarAnimaisLoteRequestDTO(List.of(10L, 11L));

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(animalRepository.findAllById(List.of(10L, 11L))).thenReturn(List.of(animal1, animal2));
        when(animalRepository.findByLoteId(1L)).thenReturn(List.of(animal1, animal2));

        LoteResponseDTO response = loteService.adicionarAnimais(1L, request);

        assertThat(animal1.getLote()).isEqualTo(lote);
        assertThat(animal2.getLote()).isEqualTo(lote);
        assertThat(response.quantidadeAnimais()).isEqualTo(2L);
        assertThat(response.pesoTotalKg()).isEqualByComparingTo("900.00");
        verify(animalRepository).saveAll(List.of(animal1, animal2));
    }

    @Test
    void deveFalharAoAdicionarAnimalJaVinculadoALote() {
        Lote lote = lote(1L, StatusLote.ABERTO);
        Animal animal = animal(10L, StatusAnimal.ATIVO);
        animal.setLote(lote(2L, StatusLote.ABERTO));

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(animalRepository.findAllById(List.of(10L))).thenReturn(List.of(animal));

        assertThatThrownBy(() -> loteService.adicionarAnimais(1L, new AdicionarAnimaisLoteRequestDTO(List.of(10L))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Animal ja pertence a um lote.");

        verify(animalRepository, never()).saveAll(org.mockito.ArgumentMatchers.anyList());
    }

    @Test
    void deveRemoverAnimalDoLoteAberto() {
        Lote lote = lote(1L, StatusLote.ABERTO);
        Animal animal = animal(10L, StatusAnimal.ATIVO);
        animal.setLote(lote);

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(animalRepository.findById(10L)).thenReturn(Optional.of(animal));
        when(animalRepository.findByLoteId(1L)).thenReturn(List.of());

        LoteResponseDTO response = loteService.removerAnimal(1L, 10L);

        assertThat(animal.getLote()).isNull();
        assertThat(response.quantidadeAnimais()).isZero();
        verify(animalRepository).save(animal);
    }

    @Test
    void deveFalharAoRemoverAnimalDeLoteCancelado() {
        Lote lote = lote(1L, StatusLote.CANCELADO);

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));

        assertThatThrownBy(() -> loteService.removerAnimal(1L, 10L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Este lote nao permite alteracoes.");

        verify(animalRepository, never()).save(org.mockito.ArgumentMatchers.any(Animal.class));
    }

    private Lote lote(Long id, StatusLote status) {
        Lote lote = new Lote();
        lote.setId(id);
        lote.setNome("Lote Nelore Setembro");
        lote.setDescricao("Animais para avaliacao futura.");
        lote.setStatus(status);
        lote.setCriadoEm(LocalDateTime.of(2026, 8, 11, 9, 30));

        return lote;
    }

    private Animal animal(Long id, StatusAnimal status) {
        Animal animal = new Animal();
        animal.setId(id);
        animal.setStatus(status);
        animal.setCodigoAnimal(id + 1000);
        animal.setRaca("Nelore");
        animal.setPesoKg(BigDecimal.valueOf(450));

        return animal;
    }
}
