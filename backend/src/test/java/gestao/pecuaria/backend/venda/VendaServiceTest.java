package gestao.pecuaria.backend.venda;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.lote.Lote;
import gestao.pecuaria.backend.lote.LoteRepository;
import gestao.pecuaria.backend.lote.enums.StatusLote;
import gestao.pecuaria.backend.pagamento.dto.CondicaoPagamentoDTO;
import gestao.pecuaria.backend.pagamento.entity.PagamentoVenda;
import gestao.pecuaria.backend.pagamento.enums.StatusPagamento;
import gestao.pecuaria.backend.pagamento.enums.TipoPagamento;
import gestao.pecuaria.backend.pagamento.repository.PagamentoVendaRepository;
import gestao.pecuaria.backend.pagamento.service.PagamentoService;
import gestao.pecuaria.backend.venda.dto.VendaLoteRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaResponseDTO;
import gestao.pecuaria.backend.venda.enums.StatusVenda;
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
import static org.mockito.ArgumentMatchers.anyList;
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

    @Mock
    private PagamentoService pagamentoService;

    @Mock
    private PagamentoVendaRepository pagamentoVendaRepository;

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
        when(animalRepository.findByLoteId(1L)).thenReturn(List.of(criarAnimal("300.00"), criarAnimal("250.50")));
        when(pagamentoVendaRepository.findByVendaIdOrderByNumeroParcelaAsc(10L)).thenReturn(List.of());

        VendaResponseDTO response = vendaService.criar(request);

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.loteId()).isEqualTo(1L);
        assertThat(response.nomeLote()).isEqualTo("Lote Nelore");
        assertThat(response.valorTotal()).isEqualByComparingTo("8500.00");
        assertThat(response.quantidadeAnimaisLote()).isEqualTo(2);
        assertThat(response.pesoTotalKgLote()).isEqualByComparingTo("550.50");
        assertThat(response.status()).isEqualTo(StatusVenda.AGUARDANDO_PAGAMENTO);
        assertThat(response.pagamentos()).isEmpty();
    }

    @Test
    void deveRealizarVendaCompletaDeLoteParcelada() {
        Lote lote = criarLote(StatusLote.ABERTO);
        Animal animal1 = criarAnimal("300.00");
        animal1.setStatus(StatusAnimal.ATIVO);
        Animal animal2 = criarAnimal("250.50");
        animal2.setStatus(StatusAnimal.ATIVO);
        VendaLoteRequestDTO request = criarVendaLoteRequest(TipoPagamento.PARCELADO);

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(animalRepository.findByLoteId(1L)).thenReturn(List.of(animal1, animal2));
        when(vendaRepository.existsByLoteId(1L)).thenReturn(false);
        when(vendaRepository.save(any(Venda.class))).thenAnswer(invocation -> {
            Venda venda = invocation.getArgument(0);
            venda.setId(20L);
            return venda;
        });
        when(pagamentoService.gerarPagamentoParcelado(any(Venda.class), any(CondicaoPagamentoDTO.class), org.mockito.ArgumentMatchers.isNull()))
                .thenAnswer(invocation -> List.of(criarPagamento(invocation.getArgument(0), 1, "20000.00", StatusPagamento.PAGO)));
        when(loteRepository.save(lote)).thenReturn(lote);
        when(animalRepository.saveAll(anyList())).thenReturn(List.of(animal1, animal2));

        VendaResponseDTO response = vendaService.realizarVendaLote(request);

        assertThat(response.id()).isEqualTo(20L);
        assertThat(response.loteId()).isEqualTo(1L);
        assertThat(response.nomeComprador()).isEqualTo("Frigorífico Boa Carne");
        assertThat(response.valorTotal()).isEqualByComparingTo("100000.00");
        assertThat(response.pesoKgVenda()).isEqualByComparingTo("550.50");
        assertThat(response.statusLote()).isEqualTo(StatusLote.VENDIDO);
        assertThat(response.quantidadeAnimaisLote()).isEqualTo(2L);
        assertThat(response.pagamentos()).hasSize(1);
        assertThat(lote.getStatus()).isEqualTo(StatusLote.VENDIDO);
        assertThat(animal1.getStatus()).isEqualTo(StatusAnimal.VENDIDO);
        assertThat(animal2.getStatus()).isEqualTo(StatusAnimal.VENDIDO);
        verify(pagamentoService).gerarPagamentoParcelado(any(Venda.class), any(CondicaoPagamentoDTO.class), org.mockito.ArgumentMatchers.isNull());
        verify(loteRepository).save(lote);
        verify(animalRepository).saveAll(List.of(animal1, animal2));
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
    void deveBloquearVendaCompletaQuandoLoteEstaCancelado() {
        Lote lote = criarLote(StatusLote.CANCELADO);
        VendaLoteRequestDTO request = criarVendaLoteRequest(TipoPagamento.A_VISTA);

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));

        assertThatThrownBy(() -> vendaService.realizarVendaLote(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Não é possível vender um lote cancelado.");

        verify(vendaRepository, never()).save(any(Venda.class));
    }

    @Test
    void deveBloquearVendaCompletaQuandoAnimalJaEstaVendido() {
        Lote lote = criarLote(StatusLote.ABERTO);
        Animal animal = criarAnimal("300.00");
        animal.setStatus(StatusAnimal.VENDIDO);
        VendaLoteRequestDTO request = criarVendaLoteRequest(TipoPagamento.A_VISTA);

        when(loteRepository.findById(1L)).thenReturn(Optional.of(lote));
        when(animalRepository.findByLoteId(1L)).thenReturn(List.of(animal));

        assertThatThrownBy(() -> vendaService.realizarVendaLote(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Não é possível vender lote com animal já vendido.");

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

    private VendaLoteRequestDTO criarVendaLoteRequest(TipoPagamento tipoPagamento) {
        return new VendaLoteRequestDTO(
                1L,
                "Frigorífico Boa Carne",
                new BigDecimal("100000.00"),
                LocalDate.of(2026, 8, 11),
                new CondicaoPagamentoDTO(
                        tipoPagamento,
                        new BigDecimal("20000.00"),
                        4,
                        30,
                        30
                )
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

    private PagamentoVenda criarPagamento(Venda venda, int numeroParcela, String valor, StatusPagamento status) {
        PagamentoVenda pagamento = new PagamentoVenda();
        pagamento.setId((long) numeroParcela);
        pagamento.setVenda(venda);
        pagamento.setNumeroParcela(numeroParcela);
        pagamento.setValor(new BigDecimal(valor));
        pagamento.setDataVencimento(LocalDate.of(2026, 8, 11));
        pagamento.setDataPagamento(status == StatusPagamento.PAGO ? LocalDate.of(2026, 8, 11) : null);
        pagamento.setStatus(status);
        return pagamento;
    }
}
