package gestao.pecuaria.backend.pasto;

import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.pasto.dto.PastoRequestDTO;
import gestao.pecuaria.backend.pasto.dto.PastoResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PastoService {

    private final PastoRepository pastoRepository;

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
}
