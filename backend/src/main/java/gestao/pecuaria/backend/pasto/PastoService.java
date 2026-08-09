package gestao.pecuaria.backend.pasto;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.pasto.dto.PastoAnimaisResumoDTO;
import gestao.pecuaria.backend.pasto.dto.PastoDetalhesDTO;
import gestao.pecuaria.backend.pasto.dto.PastoRequestDTO;
import gestao.pecuaria.backend.pasto.dto.PastoResponseDTO;
import gestao.pecuaria.backend.pasto.dto.PastoResumoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PastoService {

    private static final BigDecimal CAPACIDADE_ANIMAIS_POR_HECTARE = BigDecimal.valueOf(2);
    private static final String TIPO_PASTAGEM_NAO_CADASTRADO = "Não cadastrado";
    private static final String IDADE_NAO_INFORMADA = "Não informada";

    private final PastoRepository pastoRepository;
    private final AnimalRepository animalRepository;

    public PastoResponseDTO criar(PastoRequestDTO request) {
        Pasto pasto = toEntity(request);
        pasto.setAtivo(request.ativo() != null ? request.ativo() : Boolean.TRUE);

        return toResponseDTO(pastoRepository.save(pasto));
    }

    public List<PastoResponseDTO> listarTodos() {
        return pastoRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public PastoResponseDTO buscarPorId(Long id) {
        return toResponseDTO(buscarEntidadePorId(id));
    }

    public List<PastoResumoDTO> listarResumo() {
        return pastoRepository.findAll()
                .stream()
                .map(this::toResumoDTO)
                .toList();
    }

    public PastoDetalhesDTO buscarDetalhes(Long id) {
        Pasto pasto = buscarEntidadePorId(id);
        List<Animal> animais = buscarAnimaisAtivosDoPasto(pasto.getId());

        return new PastoDetalhesDTO(
                toResumoDTO(pasto, animais),
                montarResumoAnimais(animais)
        );
    }

    public PastoResponseDTO atualizar(Long id, PastoRequestDTO request) {
        Pasto pasto = buscarEntidadePorId(id);

        pasto.setNome(request.nome());
        pasto.setAreaHectares(request.areaHectares());
        pasto.setDescricao(request.descricao());

        if (request.ativo() != null) {
            pasto.setAtivo(request.ativo());
        }

        return toResponseDTO(pastoRepository.save(pasto));
    }

    public PastoResponseDTO desativar(Long id) {
        Pasto pasto = buscarEntidadePorId(id);
        pasto.setAtivo(Boolean.FALSE);

        return toResponseDTO(pastoRepository.save(pasto));
    }

    public PastoResponseDTO ativar(Long id) {
        Pasto pasto = buscarEntidadePorId(id);
        pasto.setAtivo(Boolean.TRUE);

        return toResponseDTO(pastoRepository.save(pasto));
    }

    private Pasto buscarEntidadePorId(Long id) {
        return pastoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pasto não encontrado com o ID: " + id));
    }

    private Pasto toEntity(PastoRequestDTO request) {
        Pasto pasto = new Pasto();
        pasto.setNome(request.nome());
        pasto.setAreaHectares(request.areaHectares());
        pasto.setDescricao(request.descricao());
        pasto.setAtivo(request.ativo());

        return pasto;
    }

    private PastoResponseDTO toResponseDTO(Pasto pasto) {
        return new PastoResponseDTO(
                pasto.getId(),
                pasto.getNome(),
                pasto.getAreaHectares(),
                pasto.getDescricao(),
                pasto.getAtivo(),
                pasto.getCriadoEm()
        );
    }

    private PastoResumoDTO toResumoDTO(Pasto pasto) {
        return toResumoDTO(pasto, buscarAnimaisAtivosDoPasto(pasto.getId()));
    }

    private PastoResumoDTO toResumoDTO(Pasto pasto, List<Animal> animaisAtivos) {
        int capacidade = calcularCapacidade(pasto.getAreaHectares());
        long quantidadeAnimais = animaisAtivos.size();
        BigDecimal ocupacaoPercentual = calcularOcupacaoPercentual(quantidadeAnimais, capacidade);

        return new PastoResumoDTO(
                pasto.getId(),
                pasto.getNome(),
                pasto.getAreaHectares(),
                capacidade,
                quantidadeAnimais,
                ocupacaoPercentual,
                calcularStatusOcupacao(ocupacaoPercentual),
                TIPO_PASTAGEM_NAO_CADASTRADO,
                pasto.getDescricao(),
                pasto.getAtivo(),
                pasto.getCriadoEm()
        );
    }

    private List<Animal> buscarAnimaisAtivosDoPasto(Long pastoId) {
        return animalRepository.findByPastoIdAndStatus(pastoId, StatusAnimal.ATIVO);
    }

    private List<PastoAnimaisResumoDTO> montarResumoAnimais(List<Animal> animais) {
        Map<String, List<Animal>> animaisPorCategoria = animais.stream()
                .collect(Collectors.groupingBy(animal -> formatarSexo(animal.getSexo())));

        return animaisPorCategoria.entrySet()
                .stream()
                .map(entry -> new PastoAnimaisResumoDTO(
                        entry.getKey(),
                        (long) entry.getValue().size(),
                        calcularPesoMedio(entry.getValue()),
                        IDADE_NAO_INFORMADA
                ))
                .toList();
    }

    private BigDecimal calcularPesoMedio(List<Animal> animais) {
        if (animais.isEmpty()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal pesoTotal = animais.stream()
                .map(Animal::getPesoKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return pesoTotal.divide(BigDecimal.valueOf(animais.size()), 2, RoundingMode.HALF_UP);
    }

    private int calcularCapacidade(BigDecimal areaHectares) {
        BigDecimal area = areaHectares != null ? areaHectares : BigDecimal.ZERO;
        int capacidade = area.multiply(CAPACIDADE_ANIMAIS_POR_HECTARE).setScale(0, RoundingMode.DOWN).intValue();

        return Math.max(capacidade, 1);
    }

    private BigDecimal calcularOcupacaoPercentual(long quantidadeAnimais, int capacidade) {
        return BigDecimal.valueOf(quantidadeAnimais)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(capacidade), 2, RoundingMode.HALF_UP);
    }

    private String calcularStatusOcupacao(BigDecimal ocupacaoPercentual) {
        if (ocupacaoPercentual.compareTo(BigDecimal.valueOf(100)) > 0) {
            return "LOTADO";
        }

        if (ocupacaoPercentual.compareTo(BigDecimal.valueOf(80)) >= 0) {
            return "ATENCAO";
        }

        return "NORMAL";
    }

    private String formatarSexo(SexoAnimal sexo) {
        if (sexo == SexoAnimal.MACHO) {
            return "Macho";
        }

        if (sexo == SexoAnimal.FEMEA) {
            return "Fêmea";
        }

        return "Não informado";
    }
}
