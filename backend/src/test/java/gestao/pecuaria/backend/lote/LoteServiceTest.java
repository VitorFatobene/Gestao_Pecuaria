package gestao.pecuaria.backend.lote;

import gestao.pecuaria.backend.animal.AnimalRepository;
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
        when(animalRepository.countByLoteId(1L)).thenReturn(0L);

        LoteResponseDTO response = loteService.criar(request);

        ArgumentCaptor<Lote> captor = ArgumentCaptor.forClass(Lote.class);
        verify(loteRepository).saveAndFlush(captor.capture());
        verify(entityManager).refresh(captor.getValue());

        assertThat(captor.getValue().getStatus()).isEqualTo(StatusLote.ABERTO);
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.nome()).isEqualTo("Lote Nelore Setembro");
        assertThat(response.status()).isEqualTo(StatusLote.ABERTO);
        assertThat(response.quantidadeAnimais()).isZero();
    }

    @Test
    void deveListarLotesFiltradosPorStatus() {
        Lote lote = lote(1L, StatusLote.ABERTO);

        when(loteRepository.findByStatus(StatusLote.ABERTO)).thenReturn(List.of(lote));
        when(animalRepository.countByLoteId(1L)).thenReturn(2L);

        List<LoteResponseDTO> response = loteService.listarTodos(StatusLote.ABERTO);

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().status()).isEqualTo(StatusLote.ABERTO);
        assertThat(response.getFirst().quantidadeAnimais()).isEqualTo(2L);
    }

    @Test
    void deveCancelarLote() {
        Lote lote = lote(1L, StatusLote.ABERTO);

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(loteRepository.save(lote)).thenReturn(lote);
        when(animalRepository.countByLoteId(1L)).thenReturn(0L);

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

    private Lote lote(Long id, StatusLote status) {
        Lote lote = new Lote();
        lote.setId(id);
        lote.setNome("Lote Nelore Setembro");
        lote.setDescricao("Animais para avaliacao futura.");
        lote.setStatus(status);
        lote.setCriadoEm(LocalDateTime.of(2026, 8, 11, 9, 30));

        return lote;
    }
}
