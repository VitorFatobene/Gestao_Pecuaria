package gestao.pecuaria.backend.dashboard.service;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.dashboard.dto.DashboardManejoDTO;
import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import gestao.pecuaria.backend.movimentacao.repository.MovimentacaoAnimalRepository;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardManejoServiceTest {

    @Mock
    private PastoRepository pastoRepository;

    @Mock
    private MovimentacaoAnimalRepository movimentacaoAnimalRepository;

    @InjectMocks
    private DashboardManejoService dashboardManejoService;

    @Test
    void deveCalcularIndicadoresDeManejo() {
        Pasto pastoNormal = criarPasto(1L, "Pasto Normal");
        Pasto pastoAtencao = criarPasto(2L, "Pasto Atencao");
        Pasto pastoCritico = criarPasto(3L, "Pasto Critico");

        List<MovimentacaoAnimal> movimentacoesAtuais = List.of(
                criarMovimentacao(1L, 1001L, pastoNormal, 10),
                criarMovimentacao(2L, 1002L, pastoAtencao, 35),
                criarMovimentacao(3L, 1003L, pastoCritico, 50),
                criarMovimentacao(4L, 1004L, pastoCritico, 5),
                criarMovimentacao(5L, 1005L, pastoAtencao, 20),
                criarMovimentacao(6L, 1006L, pastoNormal, 45)
        );

        when(pastoRepository.countByAtivoTrue()).thenReturn(3L);
        when(pastoRepository.findByAtivoTrueOrderByNomeAsc()).thenReturn(List.of(pastoAtencao, pastoCritico, pastoNormal));
        when(movimentacaoAnimalRepository.findByDataSaidaIsNull()).thenReturn(movimentacoesAtuais);

        DashboardManejoDTO resumo = dashboardManejoService.buscarResumoManejo();

        assertThat(resumo.pastosAtivos()).isEqualTo(3);
        assertThat(resumo.animaisEmPastos()).isEqualTo(6);
        assertThat(resumo.tempoMedioPermanencia()).isEqualTo(28);
        assertThat(resumo.animaisMaiorPermanencia())
                .extracting(animal -> animal.codigoAnimal())
                .containsExactly("1003", "1006", "1002", "1005", "1001");
        assertThat(resumo.pastosRotacao())
                .extracting(pasto -> pasto.nome() + ":" + pasto.quantidadeAnimais() + ":" + pasto.diasOcupacao() + ":" + pasto.status())
                .containsExactly(
                        "Pasto Atencao:2:35:ATENCAO",
                        "Pasto Critico:2:50:CRITICO",
                        "Pasto Normal:2:45:ATENCAO"
                );
    }

    private Pasto criarPasto(Long id, String nome) {
        Pasto pasto = new Pasto();
        pasto.setId(id);
        pasto.setNome(nome);
        pasto.setAreaHectares(new BigDecimal("10.00"));
        pasto.setAtivo(true);
        return pasto;
    }

    private MovimentacaoAnimal criarMovimentacao(Long id, Long codigoAnimal, Pasto pasto, int diasNoPasto) {
        Animal animal = new Animal();
        animal.setId(codigoAnimal);
        animal.setCodigoAnimal(codigoAnimal);
        animal.setRaca("Nelore");
        animal.setPesoKg(new BigDecimal("450.00"));
        animal.setStatus(StatusAnimal.ATIVO);

        MovimentacaoAnimal movimentacao = new MovimentacaoAnimal();
        movimentacao.setId(id);
        movimentacao.setAnimal(animal);
        movimentacao.setPasto(pasto);
        movimentacao.setDataEntrada(LocalDate.now().minusDays(diasNoPasto));
        movimentacao.setDataSaida(null);

        return movimentacao;
    }
}
