package gestao.pecuaria.backend.dashboard.service;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.dashboard.dto.AnimalDestaqueDTO;
import gestao.pecuaria.backend.dashboard.dto.DashboardResponseDTO;
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
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final BigDecimal COTACAO_BOI_REFERENCIA = new BigDecimal("309.50");

    private final AnimalRepository animalRepository;
    private final PastoRepository pastoRepository;
    private final VendaRepository vendaRepository;
    private final FinanceiroService financeiroService;

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
                COTACAO_BOI_REFERENCIA,
                animaisDestaque.stream().map(this::toAnimalDestaque).toList(),
                montarMovimentacoesRecentes(comprasRecentes, vendasRecentes)
        );
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
                                "Venda do animal " + venda.getAnimal().getCodigoAnimal() + " para " + venda.getNomeComprador(),
                                venda.getDataVenda().toString(),
                                venda.getValorVenda()
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

    private record MovimentacaoOrdenada(LocalDate data, MovimentacaoRecenteDTO movimentacao) {
    }
}
