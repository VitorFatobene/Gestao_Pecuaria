package gestao.pecuaria.backend.dashboard.service;

import gestao.pecuaria.backend.dashboard.dto.AnimalPermanenciaDTO;
import gestao.pecuaria.backend.dashboard.dto.DashboardManejoDTO;
import gestao.pecuaria.backend.dashboard.dto.PastoRotacaoDTO;
import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import gestao.pecuaria.backend.movimentacao.repository.MovimentacaoAnimalRepository;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.usuario.UsuarioAutenticadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardManejoService {

    private static final String NOME_ANIMAL_NAO_CADASTRADO = "Não cadastrado";
    private static final String STATUS_NORMAL = "NORMAL";
    private static final String STATUS_ATENCAO = "ATENCAO";
    private static final String STATUS_CRITICO = "CRITICO";

    private final PastoRepository pastoRepository;
    private final MovimentacaoAnimalRepository movimentacaoAnimalRepository;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    @Transactional(readOnly = true)
    public DashboardManejoDTO buscarResumoManejo() {
        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();
        List<MovimentacaoAnimal> movimentacoesAtuais = movimentacaoAnimalRepository.findByDataSaidaIsNullAndAnimalUsuarioId(usuarioId);
        int animaisEmPastos = movimentacoesAtuais.size();

        return new DashboardManejoDTO(
                Math.toIntExact(pastoRepository.countByAtivoTrueAndUsuarioId(usuarioId)),
                animaisEmPastos,
                calcularTempoMedioPermanencia(movimentacoesAtuais),
                montarAnimaisMaiorPermanencia(movimentacoesAtuais),
                montarPastosRotacao(movimentacoesAtuais)
        );
    }

    private Integer calcularTempoMedioPermanencia(List<MovimentacaoAnimal> movimentacoesAtuais) {
        if (movimentacoesAtuais.isEmpty()) {
            return 0;
        }

        int somaDias = movimentacoesAtuais.stream()
                .mapToInt(this::calcularDiasNoPasto)
                .sum();

        return Math.round((float) somaDias / movimentacoesAtuais.size());
    }

    private List<AnimalPermanenciaDTO> montarAnimaisMaiorPermanencia(List<MovimentacaoAnimal> movimentacoesAtuais) {
        return movimentacoesAtuais.stream()
                .sorted(Comparator
                        .comparing(this::calcularDiasNoPasto, Comparator.reverseOrder())
                        .thenComparing(MovimentacaoAnimal::getId, Comparator.reverseOrder()))
                .limit(5)
                .map(movimentacao -> new AnimalPermanenciaDTO(
                        String.valueOf(movimentacao.getAnimal().getCodigoAnimal()),
                        NOME_ANIMAL_NAO_CADASTRADO,
                        movimentacao.getPasto().getNome(),
                        calcularDiasNoPasto(movimentacao)
                ))
                .toList();
    }

    private List<PastoRotacaoDTO> montarPastosRotacao(List<MovimentacaoAnimal> movimentacoesAtuais) {
        Map<Long, List<MovimentacaoAnimal>> movimentacoesPorPasto = movimentacoesAtuais.stream()
                .collect(Collectors.groupingBy(movimentacao -> movimentacao.getPasto().getId()));

        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();
        return pastoRepository.findByAtivoTrueAndUsuarioIdOrderByNomeAsc(usuarioId)
                .stream()
                .map(pasto -> toPastoRotacaoDTO(pasto, movimentacoesPorPasto.getOrDefault(pasto.getId(), List.of())))
                .toList();
    }

    private PastoRotacaoDTO toPastoRotacaoDTO(Pasto pasto, List<MovimentacaoAnimal> movimentacoesDoPasto) {
        int diasOcupacao = movimentacoesDoPasto.stream()
                .mapToInt(this::calcularDiasNoPasto)
                .max()
                .orElse(0);

        return new PastoRotacaoDTO(
                pasto.getNome(),
                movimentacoesDoPasto.size(),
                diasOcupacao,
                classificarStatusRotacao(diasOcupacao)
        );
    }

    private Integer calcularDiasNoPasto(MovimentacaoAnimal movimentacao) {
        return Math.toIntExact(ChronoUnit.DAYS.between(movimentacao.getDataEntrada(), LocalDate.now()));
    }

    private String classificarStatusRotacao(int diasOcupacao) {
        if (diasOcupacao > 45) {
            return STATUS_CRITICO;
        }

        if (diasOcupacao > 30) {
            return STATUS_ATENCAO;
        }

        return STATUS_NORMAL;
    }
}
