package gestao.pecuaria.backend.compra;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.compra.dto.CompraAnimalRequestDTO;
import gestao.pecuaria.backend.compra.dto.CompraRequestDTO;
import gestao.pecuaria.backend.compra.dto.CompraResponseDTO;
import gestao.pecuaria.backend.compra.enums.TipoRateioCompra;
import gestao.pecuaria.backend.contapagar.service.ContaPagarService;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;
import gestao.pecuaria.backend.movimentacao.service.MovimentacaoAnimalService;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioAutenticadoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static gestao.pecuaria.backend.TestSecurityUtils.usuario;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompraServiceTest {

    @Mock
    private CompraRepository compraRepository;

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private PastoRepository pastoRepository;

    @Mock
    private MovimentacaoAnimalService movimentacaoAnimalService;

    @Mock
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @Mock
    private ContaPagarService contaPagarService;

    @InjectMocks
    private CompraService compraService;

    private Usuario usuario;

    @BeforeEach
    void configurarUsuario() {
        usuario = usuario("compra@teste.com");
        usuario.setId(1L);
    }

    @Test
    void deveCriarCompraComAnimalParaUsuarioAutenticado() {
        CompraRequestDTO request = criarRequest(TipoRateioCompra.IGUAL, List.of(animalRequest(1001L, "420.00", null)));

        when(usuarioAutenticadoService.getUsuarioAutenticado()).thenReturn(usuario);
        when(animalRepository.findByCodigoAnimalIn(List.of(1001L))).thenReturn(List.of());
        when(compraRepository.save(any())).thenAnswer(invocation -> {
            Compra compra = invocation.getArgument(0);
            compra.setId(1L);
            compra.setCriadoEm(LocalDateTime.of(2026, 10, 6, 10, 30));
            return compra;
        });
        when(animalRepository.save(any())).thenAnswer(invocation -> {
            Animal animal = invocation.getArgument(0);
            animal.setId(10L);
            return animal;
        });
        when(animalRepository.findByCompraIdAndUsuarioId(1L, 1L)).thenAnswer(invocation -> {
            Animal animal = new Animal();
            animal.setId(10L);
            animal.setUsuario(usuario);
            animal.setCodigoAnimal(1001L);
            animal.setRaca("Nelore");
            animal.setPesoKg(new BigDecimal("420.00"));
            animal.setValorPago(new BigDecimal("18000.00"));
            animal.setStatus(StatusAnimal.ATIVO);
            return List.of(animal);
        });

        CompraResponseDTO response = compraService.criar(request);

        ArgumentCaptor<Compra> compraCaptor = ArgumentCaptor.forClass(Compra.class);
        ArgumentCaptor<Animal> animalCaptor = ArgumentCaptor.forClass(Animal.class);
        verify(compraRepository).save(compraCaptor.capture());
        verify(animalRepository).save(animalCaptor.capture());

        assertThat(compraCaptor.getValue().getUsuario()).isEqualTo(usuario);
        assertThat(animalCaptor.getValue().getUsuario()).isEqualTo(usuario);
        assertThat(animalCaptor.getValue().getCompra()).isEqualTo(compraCaptor.getValue());
        assertThat(animalCaptor.getValue().getValorPago()).isEqualByComparingTo("18000.00");
        assertThat(response.quantidadeAnimais()).isEqualTo(1);
        assertThat(response.animais()).singleElement()
                .satisfies(animal -> assertThat(animal.valorPago()).isEqualByComparingTo("18000.00"));
    }

    @Test
    void deveListarComprasDoUsuarioAutenticado() {
        Compra compra = compra(1L, usuario);

        when(usuarioAutenticadoService.getUsuarioAutenticadoId()).thenReturn(1L);
        when(compraRepository.findAllByUsuarioIdOrderByDataCompraDescIdDesc(1L)).thenReturn(List.of(compra));
        when(animalRepository.findByCompraIdAndUsuarioId(1L, 1L)).thenReturn(List.of());

        List<CompraResponseDTO> response = compraService.listarTodos();

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().id()).isEqualTo(1L);
        verify(compraRepository).findAllByUsuarioIdOrderByDataCompraDescIdDesc(1L);
    }

    @Test
    void deveBuscarCompraDoUsuarioAutenticadoComAnimaisVinculados() {
        Compra compra = compra(1L, usuario);
        Animal animal = animal(10L, compra, usuario);

        when(usuarioAutenticadoService.getUsuarioAutenticadoId()).thenReturn(1L);
        when(compraRepository.findByIdAndUsuarioId(1L, 1L)).thenReturn(Optional.of(compra));
        when(animalRepository.findByCompraIdAndUsuarioId(1L, 1L)).thenReturn(List.of(animal));

        CompraResponseDTO response = compraService.buscarPorId(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.quantidadeAnimais()).isEqualTo(1);
        assertThat(response.pesoTotalKg()).isEqualByComparingTo("420.00");
        assertThat(response.valorMedioAnimal()).isEqualByComparingTo("18000.00");
        assertThat(response.animais()).singleElement().satisfies(animalResumo -> {
            assertThat(animalResumo.id()).isEqualTo(10L);
            assertThat(animalResumo.codigoAnimal()).isEqualTo(1010L);
            assertThat(animalResumo.valorPago()).isEqualByComparingTo("9000.00");
        });
    }

    @Test
    void deveRetornarNaoEncontradoQuandoCompraNaoPertenceAoUsuarioAutenticado() {
        when(usuarioAutenticadoService.getUsuarioAutenticadoId()).thenReturn(1L);
        when(compraRepository.findByIdAndUsuarioId(2L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> compraService.buscarPorId(2L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Compra nao encontrada com o ID: 2");
    }

    private CompraRequestDTO criarRequest(TipoRateioCompra tipoRateio, List<CompraAnimalRequestDTO> animais) {
        return new CompraRequestDTO(
                "Fazenda Santa Luzia",
                LocalDate.of(2026, 10, 6),
                new BigDecimal("18000.00"),
                "Negociacao inicial.",
                tipoRateio,
                TipoPagamentoContaPagar.A_VISTA,
                false,
                null,
                null,
                null,
                null,
                null,
                null,
                animais
        );
    }

    private CompraAnimalRequestDTO animalRequest(Long codigoAnimal, String pesoKg, BigDecimal valorPago) {
        return new CompraAnimalRequestDTO(
                codigoAnimal,
                "Nelore",
                SexoAnimal.MACHO,
                new BigDecimal(pesoKg),
                null,
                null,
                valorPago
        );
    }

    private Compra compra(Long id, Usuario usuario) {
        Compra compra = new Compra();
        compra.setId(id);
        compra.setUsuario(usuario);
        compra.setFornecedor("Fazenda Santa Luzia");
        compra.setDataCompra(LocalDate.of(2026, 10, 6));
        compra.setValorTotal(new BigDecimal("18000.00"));
        compra.setCriadoEm(LocalDateTime.of(2026, 10, 6, 10, 30));
        return compra;
    }

    private Animal animal(Long id, Compra compra, Usuario usuario) {
        Animal animal = new Animal();
        animal.setId(id);
        animal.setUsuario(usuario);
        animal.setCompra(compra);
        animal.setCodigoAnimal(1000L + id);
        animal.setRaca("Nelore");
        animal.setPesoKg(new BigDecimal("420.00"));
        animal.setValorPago(new BigDecimal("9000.00"));
        animal.setValorFrete(BigDecimal.ZERO);
        animal.setNomeVendedor("Fazenda Santa Luzia");
        animal.setDataCompra(LocalDate.of(2026, 10, 6));
        animal.setStatus(StatusAnimal.ATIVO);
        return animal;
    }
}
