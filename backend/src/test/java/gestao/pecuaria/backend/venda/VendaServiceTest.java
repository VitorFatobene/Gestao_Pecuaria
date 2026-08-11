package gestao.pecuaria.backend.venda;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.lote.Lote;
import gestao.pecuaria.backend.lote.LoteRepository;
import gestao.pecuaria.backend.lote.enums.StatusLote;
import gestao.pecuaria.backend.venda.dto.VendaRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaResponseDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VendaServiceTest {

    @Mock
    private VendaRepository vendaRepository;

    @Mock
    private LoteRepository loteRepository;

    @Mock
    private AnimalRepository animalRepository;

    @InjectMocks
    private VendaService vendaService;

    @Test
    void deveCriarVendaParaLote() {
        Lote lote = criarLote(StatusLote.ABERTO);
        VendaRequestDTO request = criarRequest();

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(animalRepository.existsByLoteId(1L)).thenReturn(true);
        when(vendaRepository.existsByLoteId(1L)).thenReturn(false);
        when(vendaRepository.save(any(Venda.class))).thenAnswer(invocation -> {
            Venda venda = invocation.getArgument(0);
            venda.setId(10L);
            return venda;
        });
        when(animalRepository.countByLoteId(1L)).thenReturn(2L);
        when(animalRepository.findByLoteId(1L)).thenReturn(List.of(criarAnimal("300.00"), criarAnimal("250.50")));

        VendaResponseDTO response = vendaService.criar(request);

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.loteId()).isEqualTo(1L);
        assertThat(response.nomeLote()).isEqualTo("Lote Nelore");
        assertThat(response.valorTotal()).isEqualByComparingTo("8500.00");
        assertThat(response.quantidadeAnimaisLote()).isEqualTo(2);
        assertThat(response.pesoTotalKgLote()).isEqualByComparingTo("550.50");
    }

    @Test
    void deveBloquearVendaQuandoLoteNaoExiste() {
        VendaRequestDTO request = criarRequest();
        when(loteRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vendaService.criar(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Lote não encontrado com o ID: 1");

        verify(vendaRepository, never()).save(any(Venda.class));
    }

    @Test
    void deveBloquearVendaQuandoLoteNaoPossuiAnimais() {
        Lote lote = criarLote(StatusLote.ABERTO);
        VendaRequestDTO request = criarRequest();

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(animalRepository.existsByLoteId(1L)).thenReturn(false);

        assertThatThrownBy(() -> vendaService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Não é possível vender um lote sem animais.");

        verify(vendaRepository, never()).save(any(Venda.class));
    }

    @Test
    void deveBloquearVendaQuandoLoteJaEstaVendido() {
        Lote lote = criarLote(StatusLote.VENDIDO);
        VendaRequestDTO request = criarRequest();

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(animalRepository.existsByLoteId(1L)).thenReturn(true);

        assertThatThrownBy(() -> vendaService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Este lote já foi vendido.");

        verify(vendaRepository, never()).save(any(Venda.class));
    }

    @Test
    void deveBloquearVendaDuplicadaParaMesmoLote() {
        Lote lote = criarLote(StatusLote.ABERTO);
        VendaRequestDTO request = criarRequest();

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(animalRepository.existsByLoteId(1L)).thenReturn(true);
        when(vendaRepository.existsByLoteId(1L)).thenReturn(true);

        assertThatThrownBy(() -> vendaService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Já existe um registro de venda para este lote.");

        verify(vendaRepository, never()).save(any(Venda.class));
    }

    private VendaRequestDTO criarRequest() {
        return new VendaRequestDTO(
                1L,
                "Frigorífico Boa Carne",
                new BigDecimal("8500.00"),
                LocalDate.of(2026, 8, 11),
                new BigDecimal("550.50")
        );
    }

    private Lote criarLote(StatusLote status) {
        Lote lote = new Lote();
        lote.setId(1L);
        lote.setNome("Lote Nelore");
        lote.setStatus(status);
        return lote;
    }

    private Animal criarAnimal(String pesoKg) {
        Animal animal = new Animal();
        animal.setPesoKg(new BigDecimal(pesoKg));
        return animal;
    }
}
