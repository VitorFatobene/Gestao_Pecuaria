package gestao.pecuaria.backend.lote;

import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.lote.dto.LoteRequestDTO;
import gestao.pecuaria.backend.lote.dto.LoteResponseDTO;
import gestao.pecuaria.backend.lote.enums.StatusLote;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        lote.setNome(request.nome());
        lote.setDescricao(request.descricao());

        return toResponseDTO(loteRepository.save(lote));
    }

    @Transactional
    public LoteResponseDTO cancelar(Long id) {
        return alterarStatus(id, StatusLote.CANCELADO);
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

    private LoteResponseDTO toResponseDTO(Lote lote) {
        return new LoteResponseDTO(
                lote.getId(),
                lote.getNome(),
                lote.getDescricao(),
                lote.getStatus(),
                animalRepository.countByLoteId(lote.getId()),
                lote.getCriadoEm()
        );
    }
}
