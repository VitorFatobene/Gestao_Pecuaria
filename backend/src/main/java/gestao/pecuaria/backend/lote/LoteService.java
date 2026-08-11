package gestao.pecuaria.backend.lote;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.lote.dto.AdicionarAnimaisLoteRequestDTO;
import gestao.pecuaria.backend.lote.dto.LoteAnimalResumoDTO;
import gestao.pecuaria.backend.lote.dto.LoteRequestDTO;
import gestao.pecuaria.backend.lote.dto.LoteResponseDTO;
import gestao.pecuaria.backend.lote.enums.StatusLote;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoteService {

    private final LoteRepository loteRepository;
    private final AnimalRepository animalRepository;
    private final EntityManager entityManager;

    @Transactional
    public LoteResponseDTO criar(LoteRequestDTO request) {
        Lote lote = new Lote();
        lote.setNome(request.nome());
        lote.setDescricao(request.descricao());
        lote.setStatus(StatusLote.ABERTO);

        Lote loteSalvo = loteRepository.saveAndFlush(lote);
        entityManager.refresh(loteSalvo);

        return toResponseDTO(loteSalvo);
    }

    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarTodos(StatusLote status) {
        List<Lote> lotes = status != null ? loteRepository.findByStatus(status) : loteRepository.findAll();

        return lotes.stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public LoteResponseDTO buscarPorId(Long id) {
        return toResponseDTO(buscarEntidadePorId(id));
    }

    @Transactional
    public LoteResponseDTO atualizar(Long id, LoteRequestDTO request) {
        Lote lote = buscarEntidadePorId(id);
        validarLoteAberto(lote);
        lote.setNome(request.nome());
        lote.setDescricao(request.descricao());

        return toResponseDTO(loteRepository.save(lote));
    }

    @Transactional
    public LoteResponseDTO cancelar(Long id) {
        Lote lote = buscarEntidadePorId(id);
        validarLoteAberto(lote);

        return alterarStatus(id, StatusLote.CANCELADO);
    }

    @Transactional
    public LoteResponseDTO adicionarAnimais(Long id, AdicionarAnimaisLoteRequestDTO request) {
        Lote lote = buscarEntidadePorId(id);
        validarLoteAberto(lote);

        List<Long> animalIds = request.animalIds().stream().distinct().toList();
        if (animalIds.size() != request.animalIds().size()) {
            throw new IllegalArgumentException("A lista de animais nao pode conter IDs duplicados.");
        }

        List<Animal> animais = animalRepository.findAllById(animalIds);
        if (animais.size() != animalIds.size()) {
            throw new ResourceNotFoundException("Um ou mais animais informados nao foram encontrados.");
        }

        animais.forEach(this::validarAnimalDisponivelParaLote);
        animais.forEach(animal -> animal.setLote(lote));
        animalRepository.saveAll(animais);

        return toResponseDTO(lote);
    }

    @Transactional
    public LoteResponseDTO removerAnimal(Long loteId, Long animalId) {
        Lote lote = buscarEntidadePorId(loteId);
        validarLoteAberto(lote);

        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal nao encontrado com o ID: " + animalId));

        if (animal.getLote() == null || !animal.getLote().getId().equals(loteId)) {
            throw new IllegalArgumentException("Animal nao pertence ao lote informado.");
        }

        animal.setLote(null);
        animalRepository.save(animal);

        return toResponseDTO(lote);
    }

    @Transactional
    public LoteResponseDTO alterarStatus(Long id, StatusLote status) {
        Lote lote = buscarEntidadePorId(id);
        lote.setStatus(status);

        return toResponseDTO(loteRepository.save(lote));
    }

    @Transactional
    public void excluir(Long id) {
        Lote lote = buscarEntidadePorId(id);

        if (animalRepository.existsByLoteId(id)) {
            throw new IllegalArgumentException("Nao e possivel excluir um lote que possui animais associados.");
        }

        loteRepository.delete(lote);
    }

    private Lote buscarEntidadePorId(Long id) {
        return loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote nao encontrado com o ID: " + id));
    }

    private void validarLoteAberto(Lote lote) {
        if (lote.getStatus() != StatusLote.ABERTO) {
            throw new IllegalArgumentException("Este lote nao permite alteracoes.");
        }
    }

    private void validarAnimalDisponivelParaLote(Animal animal) {
        if (animal.getStatus() != StatusAnimal.ATIVO) {
            throw new IllegalArgumentException("Apenas animais ativos podem ser associados a um lote.");
        }

        if (animal.getLote() != null) {
            throw new IllegalArgumentException("Animal ja pertence a um lote.");
        }
    }

    private LoteResponseDTO toResponseDTO(Lote lote) {
        List<Animal> animais = animalRepository.findByLoteId(lote.getId());
        BigDecimal pesoTotalKg = animais.stream()
                .map(Animal::getPesoKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new LoteResponseDTO(
                lote.getId(),
                lote.getNome(),
                lote.getDescricao(),
                lote.getStatus(),
                (long) animais.size(),
                pesoTotalKg,
                animais.stream()
                        .map(this::toAnimalResumoDTO)
                        .toList(),
                lote.getCriadoEm()
        );
    }

    private LoteAnimalResumoDTO toAnimalResumoDTO(Animal animal) {
        return new LoteAnimalResumoDTO(
                animal.getId(),
                animal.getCodigoAnimal(),
                animal.getRaca(),
                animal.getSexo(),
                animal.getPesoKg(),
                animal.getStatus()
        );
    }
}
