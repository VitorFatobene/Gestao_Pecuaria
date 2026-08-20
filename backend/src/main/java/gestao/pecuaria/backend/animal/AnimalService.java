package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.dto.AnimalResponseDTO;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.lote.Lote;
import gestao.pecuaria.backend.movimentacao.service.MovimentacaoAnimalService;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

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
        return animalRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnimalResponseDTO> listarPorPasto(Long pastoId) {
        buscarPastoPorId(pastoId);

        return animalRepository.findByPastoIdAndStatus(pastoId, StatusAnimal.ATIVO)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnimalResponseDTO> listarPorDataCompra(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null) {
            throw new IllegalArgumentException("As datas inicial e final são obrigatórias.");
        }

        if (inicio.isAfter(fim)) {
            throw new IllegalArgumentException("A data inicial não pode ser maior que a data final.");
        }

        return animalRepository.findByDataCompraBetweenAndStatus(inicio, fim, StatusAnimal.ATIVO)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public AnimalResponseDTO buscarPorId(Long id) {
        return toResponseDTO(buscarEntidadePorId(id));
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
        Pasto pasto = animal.getPasto();
        Lote lote = animal.getLote();

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
                lote != null ? lote.getId() : null,
                lote != null ? lote.getNome() : null,
                lote != null ? lote.getStatus() : null,
                animal.getCriadoEm()
        );
    }

    private BigDecimal calcularPesoArroba(BigDecimal pesoKg) {
        return pesoKg.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
    }
}
