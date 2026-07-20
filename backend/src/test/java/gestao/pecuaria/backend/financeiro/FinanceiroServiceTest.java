package gestao.pecuaria.backend.financeiro;

import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.financeiro.dto.FinanceiroResumoDTO;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.venda.VendaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinanceiroServiceTest {

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private PastoRepository pastoRepository;

    @Mock
    private VendaRepository vendaRepository;

    @InjectMocks
    private FinanceiroService financeiroService;

    @Test
    void deveGerarResumoFinanceiro() {
        when(animalRepository.somarTotalGasto()).thenReturn(new BigDecimal("1530.345"));
        when(vendaRepository.somarGanhoTotal()).thenReturn(new BigDecimal("2000.10"));
        when(animalRepository.count()).thenReturn(10L);
        when(animalRepository.countByStatus(StatusAnimal.ATIVO)).thenReturn(6L);
        when(animalRepository.countByStatus(StatusAnimal.VENDIDO)).thenReturn(3L);
        when(animalRepository.countByStatus(StatusAnimal.INATIVO)).thenReturn(1L);
        when(pastoRepository.count()).thenReturn(2L);
        when(vendaRepository.count()).thenReturn(3L);

        FinanceiroResumoDTO resumo = financeiroService.gerarResumo();

        assertThat(resumo.totalGasto()).isEqualByComparingTo("1530.35");
        assertThat(resumo.ganhoTotal()).isEqualByComparingTo("2000.10");
        assertThat(resumo.lucroTotal()).isEqualByComparingTo("469.75");
        assertThat(resumo.totalAnimaisCadastrados()).isEqualTo(10);
        assertThat(resumo.totalAnimaisAtivos()).isEqualTo(6);
        assertThat(resumo.totalAnimaisVendidos()).isEqualTo(3);
        assertThat(resumo.totalAnimaisInativos()).isEqualTo(1);
        assertThat(resumo.totalPastosCadastrados()).isEqualTo(2);
        assertThat(resumo.totalVendasRealizadas()).isEqualTo(3);
    }

    @Test
    void deveAssumirZeroQuandoSomasRetornaremNull() {
        when(animalRepository.somarTotalGasto()).thenReturn(null);
        when(vendaRepository.somarGanhoTotal()).thenReturn(null);

        FinanceiroResumoDTO resumo = financeiroService.gerarResumo();

        assertThat(resumo.totalGasto()).isEqualByComparingTo("0.00");
        assertThat(resumo.ganhoTotal()).isEqualByComparingTo("0.00");
        assertThat(resumo.lucroTotal()).isEqualByComparingTo("0.00");
    }
}
