package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.dto.AnimalResponseDTO;
import gestao.pecuaria.backend.animal.dto.LocalizacaoAnimalDTO;
import gestao.pecuaria.backend.animal.dto.MovimentacaoAnimalResponseDTO;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.lote.Lote;
import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import gestao.pecuaria.backend.movimentacao.service.MovimentacaoAnimalService;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.pasto.dto.PastoResumoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnimalService {

    private final AnimalRepository animalRepository;
    private final PastoRepository pastoRepository;
    private final MovimentacaoAnimalService movimentacaoAnimalService;

    @Transactional
    public AnimalResponseDTO criar(AnimalRequestDTO request) {
        Animal animal = new Animal();
        preencherDadosBasicos(animal, request);
        animal.setStatus(StatusAnimal.ATIVO);
        Pasto pasto = buscarPastoOuNull(request.pastoId());
        animal.setPasto(pasto);

        Animal animalSalvo = animalRepository.save(animal);
        registrarEntradaInicialSeNecessario(animalSalvo, pasto);

        return toResponseDTO(animalSalvo);
    }

    @Transactional(readOnly = true)
    public List<AnimalResponseDTO> listarTodos() {
        return toResponseDTOs(animalRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<AnimalResponseDTO> listarPorPasto(Long pastoId) {
        buscarPastoPorId(pastoId);

        return toResponseDTOs(animalRepository.findByPastoIdAndStatus(pastoId, StatusAnimal.ATIVO));
    }

    @Transactional(readOnly = true)
    public List<AnimalResponseDTO> listarPorDataCompra(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null) {
            throw new IllegalArgumentException("As datas inicial e final são obrigatórias.");
        }

        if (inicio.isAfter(fim)) {
            throw new IllegalArgumentException("A data inicial não pode ser maior que a data final.");
        }

        return toResponseDTOs(animalRepository.findByDataCompraBetweenAndStatus(inicio, fim, StatusAnimal.ATIVO));
    }

    @Transactional(readOnly = true)
    public AnimalResponseDTO buscarPorId(Long id) {
        return toResponseDTO(buscarEntidadePorId(id));
    }

    @Transactional(readOnly = true)
    public LocalizacaoAnimalDTO buscarLocalizacaoAtual(Long animalId) {
        Animal animal = buscarEntidadePorId(animalId);

        return movimentacaoAnimalService.buscarLocalizacaoAtual(animal);
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoAnimalResponseDTO> buscarHistoricoMovimentacoes(Long animalId) {
        buscarEntidadePorId(animalId);

        return movimentacaoAnimalService.buscarHistoricoMovimentacoes(animalId);
    }

    public AnimalResponseDTO atualizar(Long id, AnimalRequestDTO request) {
        Animal animal = buscarEntidadePorId(id);
        preencherDadosBasicos(animal, request);
        animal.setPasto(buscarPastoOuNull(request.pastoId()));

        return toResponseDTO(animalRepository.save(animal));
    }

    public void deletar(Long id) {
        Animal animal = buscarEntidadePorId(id);
        animal.setStatus(StatusAnimal.INATIVO);
        animalRepository.save(animal);
    }

    @Transactional
    public AnimalResponseDTO alterarPasto(Long animalId, Long pastoId) {
        Animal animal = buscarEntidadePorId(animalId);
        validarAnimalAtivoParaAlterarPasto(animal);

        Pasto pasto = buscarPastoPorId(pastoId);
        validarPastoAtivo(pasto);
        validarTrocaDePastoPermitida(animal, pasto);

        movimentacaoAnimalService.trocarAnimalDePasto(animal, pasto);
        animal.setPasto(pasto);
        return toResponseDTO(animalRepository.save(animal));
    }

    public AnimalResponseDTO removerPasto(Long animalId) {
        Animal animal = buscarEntidadePorId(animalId);
        validarAnimalAtivoParaRemoverPasto(animal);

        animal.setPasto(null);
        return toResponseDTO(animalRepository.save(animal));
    }

    private Animal buscarEntidadePorId(Long id) {
        return animalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal não encontrado com o ID: " + id));
    }

    private void preencherDadosBasicos(Animal animal, AnimalRequestDTO request) {
        animal.setCodigoAnimal(request.codigoAnimal());
        animal.setRaca(request.raca());
        animal.setSexo(request.sexo());
        animal.setPesoKg(request.pesoKg());
        animal.setValorPago(request.valorPago());
        animal.setValorFrete(request.valorFrete());
        animal.setNomeVendedor(request.nomeVendedor());
        animal.setDataCompra(request.dataCompra());
        animal.setImagemUrl(request.imagemUrl());
    }

    private Pasto buscarPastoOuNull(Long pastoId) {
        if (pastoId == null) {
            return null;
        }

        return buscarPastoPorId(pastoId);
    }

    private Pasto buscarPastoPorId(Long pastoId) {
        return pastoRepository.findById(pastoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pasto não encontrado com o ID: " + pastoId));
    }

    private void registrarEntradaInicialSeNecessario(Animal animal, Pasto pasto) {
        if (pasto != null) {
            movimentacaoAnimalService.registrarEntrada(animal, pasto);
        }
    }

    private void validarAnimalAtivoParaAlterarPasto(Animal animal) {
        if (animal.getStatus() != StatusAnimal.ATIVO) {
            throw new IllegalArgumentException("Apenas animais ativos podem ter o pasto alterado.");
        }
    }

    private void validarTrocaDePastoPermitida(Animal animal, Pasto novoPasto) {
        Pasto pastoAtual = animal.getPasto();

        if (pastoAtual == null) {
            throw new IllegalArgumentException("Animal não possui pasto atual.");
        }

        if (pastoAtual.getId().equals(novoPasto.getId())) {
            throw new IllegalArgumentException("Animal já está neste pasto.");
        }
    }

    private void validarAnimalAtivoParaRemoverPasto(Animal animal) {
        if (animal.getStatus() != StatusAnimal.ATIVO) {
            throw new IllegalArgumentException("Apenas animais ativos podem ser removidos de um pasto.");
        }
    }

    private void validarPastoAtivo(Pasto pasto) {
        if (!Boolean.TRUE.equals(pasto.getAtivo())) {
            throw new IllegalArgumentException("Não é possível vincular um animal a um pasto inativo.");
        }
    }

    private AnimalResponseDTO toResponseDTO(Animal animal) {
        MovimentacaoAnimal movimentacaoAtual = movimentacaoAnimalService.buscarMovimentacaoAtual(animal.getId()).orElse(null);

        return toResponseDTO(animal, movimentacaoAtual);
    }

    private List<AnimalResponseDTO> toResponseDTOs(List<Animal> animais) {
        Map<Long, MovimentacaoAnimal> movimentacoesAtuaisPorAnimalId = movimentacaoAnimalService.buscarMovimentacoesAtuais(
                        animais.stream()
                                .map(Animal::getId)
                                .toList()
                )
                .stream()
                .collect(Collectors.toMap(
                        movimentacao -> movimentacao.getAnimal().getId(),
                        Function.identity(),
                        (primeira, segunda) -> Comparator
                                .comparing(MovimentacaoAnimal::getDataEntrada)
                                .thenComparing(MovimentacaoAnimal::getId)
                                .compare(primeira, segunda) >= 0 ? primeira : segunda
                ));

        return animais.stream()
                .map(animal -> toResponseDTO(animal, movimentacoesAtuaisPorAnimalId.get(animal.getId())))
                .toList();
    }

    private AnimalResponseDTO toResponseDTO(Animal animal, MovimentacaoAnimal movimentacaoAtual) {
        Pasto pasto = animal.getPasto();
        Lote lote = animal.getLote();
        PastoResumoDTO pastoAtual = movimentacaoAtual != null ? toPastoResumoDTO(movimentacaoAtual.getPasto()) : null;
        Integer diasNoPasto = movimentacaoAtual != null
                ? Math.toIntExact(ChronoUnit.DAYS.between(movimentacaoAtual.getDataEntrada(), LocalDate.now()))
                : null;

        return new AnimalResponseDTO(
                animal.getId(),
                animal.getCodigoAnimal(),
                animal.getRaca(),
                animal.getSexo(),
                animal.getPesoKg(),
                calcularPesoArroba(animal.getPesoKg()),
                animal.getValorPago(),
                animal.getValorFrete(),
                animal.getNomeVendedor(),
                animal.getDataCompra(),
                animal.getImagemUrl(),
                animal.getStatus(),
                pasto != null ? pasto.getId() : null,
                pasto != null ? pasto.getNome() : null,
                pastoAtual,
                diasNoPasto,
                lote != null ? lote.getId() : null,
                lote != null ? lote.getNome() : null,
                lote != null ? lote.getStatus() : null,
                animal.getCriadoEm()
        );
    }

    private PastoResumoDTO toPastoResumoDTO(Pasto pasto) {
        return new PastoResumoDTO(
                pasto.getId(),
                pasto.getNome(),
                pasto.getAreaHectares(),
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                pasto.getDescricao(),
                pasto.getAtivo(),
                pasto.getCriadoEm()
        );
    }

    private BigDecimal calcularPesoArroba(BigDecimal pesoKg) {
        return pesoKg.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
    }
}
