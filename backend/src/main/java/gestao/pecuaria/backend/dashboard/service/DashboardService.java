package gestao.pecuaria.backend.dashboard.service;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.cotacao.dto.CotacaoBoiResponseDTO;
import gestao.pecuaria.backend.cotacao.exception.CotacaoIndisponivelException;
import gestao.pecuaria.backend.cotacao.service.CotacaoService;
import gestao.pecuaria.backend.dashboard.dto.AnimalDestaqueDTO;
import gestao.pecuaria.backend.dashboard.dto.DashboardResponseDTO;
import gestao.pecuaria.backend.dashboard.dto.FinancialChartDTO;
import gestao.pecuaria.backend.dashboard.dto.MovimentacaoRecenteDTO;
import gestao.pecuaria.backend.financeiro.FinanceiroService;
import gestao.pecuaria.backend.financeiro.dto.FinanceiroResumoDTO;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.venda.Venda;
import gestao.pecuaria.backend.venda.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AnimalRepository animalRepository;
    private final PastoRepository pastoRepository;
    private final VendaRepository vendaRepository; 
    private final FinanceiroService financeiroService;
    private final CotacaoService cotacaoService;

    @Transactional(readOnly = true)
    public DashboardResponseDTO obterDadosDashboard() {
        FinanceiroResumoDTO resumoFinanceiro = financeiroService.gerarResumo();
        List<Animal> animaisDestaque = animalRepository.findTop5ByStatusOrderByIdDesc(StatusAnimal.ATIVO);
        List<Animal> comprasRecentes = animalRepository.findTop5ByOrderByIdDesc();
        List<Venda> vendasRecentes = vendaRepository.findTop5ByOrderByDataVendaDescIdDesc();

        return new DashboardResponseDTO(
                animalRepository.countByStatus(StatusAnimal.ATIVO),
                pastoRepository.count(),
                resumoFinanceiro.lucroTotal(),
                vendaRepository.count(),
                obterCotacaoBoiSemInterromperDashboard(),
                animaisDestaque.stream().map(this::toAnimalDestaque).toList(),
                montarMovimentacoesRecentes(comprasRecentes, vendasRecentes),
                montarEvolucaoFinanceira()
        );
    }

    private CotacaoBoiResponseDTO obterCotacaoBoiSemInterromperDashboard() {
        try {
            return cotacaoService.obterCotacaoBoi();
        } catch (CotacaoIndisponivelException exception) {
            return null;
        }
    }

    private AnimalDestaqueDTO toAnimalDestaque(Animal animal) {
        return new AnimalDestaqueDTO(
                animal.getId(),
                String.valueOf(animal.getCodigoAnimal()),
                animal.getRaca(),
                animal.getPesoKg(),
                animal.getStatus().name(),
                animal.getPasto() != null ? animal.getPasto().getNome() : "Sem pasto"
        );
    }

    private List<MovimentacaoRecenteDTO> montarMovimentacoesRecentes(List<Animal> animaisRecentes, List<Venda> vendasRecentes) {
        List<MovimentacaoOrdenada> compras = animaisRecentes.stream()
                .map(animal -> new MovimentacaoOrdenada(
                        animal.getDataCompra(),
                        new MovimentacaoRecenteDTO(
                                "COMPRA",
                                "Compra do animal " + animal.getCodigoAnimal(),
                                animal.getDataCompra().toString(),
                                valorCompra(animal)
                        )
                ))
                .toList();

        List<MovimentacaoOrdenada> vendas = vendasRecentes.stream()
                .map(venda -> new MovimentacaoOrdenada(
                        venda.getDataVenda(),
                        new MovimentacaoRecenteDTO(
                                "VENDA",
                                "Venda do lote " + venda.getLote().getNome() + " para " + venda.getNomeComprador(),
                                venda.getDataVenda().toString(),
                                venda.getValorTotal()
                        )
                ))
                .toList();

        return java.util.stream.Stream.concat(compras.stream(), vendas.stream())
                .sorted(Comparator.comparing(MovimentacaoOrdenada::data).reversed())
                .limit(5)
                .map(MovimentacaoOrdenada::movimentacao)
                .toList();
    }

    private BigDecimal valorCompra(Animal animal) {
        return valorOuZero(animal.getValorPago()).add(valorOuZero(animal.getValorFrete()));
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }

    private List<FinancialChartDTO> montarEvolucaoFinanceira() {
        YearMonth mesAtual = YearMonth.now();
        YearMonth primeiroMes = mesAtual.minusMonths(5);
        LocalDate inicio = primeiroMes.atDay(1);
        LocalDate fim = mesAtual.atEndOfMonth();

        Map<YearMonth, BigDecimal> receitasPorMes = vendaRepository.findByDataVendaBetween(inicio, fim)
                .stream()
                .collect(Collectors.groupingBy(
                        venda -> YearMonth.from(venda.getDataVenda()),
                        Collectors.reducing(BigDecimal.ZERO, venda -> valorOuZero(venda.getValorTotal()), BigDecimal::add)
                ));

        Map<YearMonth, BigDecimal> despesasPorMes = animalRepository.findByDataCompraBetween(inicio, fim)
                .stream()
                .collect(Collectors.groupingBy(
                        animal -> YearMonth.from(animal.getDataCompra()),
                        Collectors.reducing(BigDecimal.ZERO, this::valorCompra, BigDecimal::add)
                ));

        Map<YearMonth, FinancialChartDTO> evolucao = new LinkedHashMap<>();

        for (int i = 0; i < 6; i++) {
            YearMonth mes = primeiroMes.plusMonths(i);
            evolucao.put(mes, new FinancialChartDTO(
                    abreviarMes(mes),
                    formatarValor(receitasPorMes.get(mes)),
                    formatarValor(despesasPorMes.get(mes))
            ));
        }

        return List.copyOf(evolucao.values());
    }

    private String abreviarMes(YearMonth mes) {
        String nomeMes = mes.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, Locale.of("pt", "BR"));
        String semPonto = nomeMes.replace(".", "");

        return semPonto.substring(0, 1).toUpperCase(Locale.of("pt", "BR")) + semPonto.substring(1);
    }

    private BigDecimal formatarValor(BigDecimal valor) {
        return valorOuZero(valor).setScale(2, RoundingMode.HALF_UP);
    }

    private record MovimentacaoOrdenada(LocalDate data, MovimentacaoRecenteDTO movimentacao) {
    }
}
