package gestao.pecuaria.backend.pasto;

import gestao.pecuaria.backend.pasto.dto.PastoRequestDTO;
import gestao.pecuaria.backend.pasto.dto.PastoResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/pastos")
@RequiredArgsConstructor
public class PastoController {

    private final PastoService pastoService;

    @PostMapping
    public ResponseEntity<PastoResponseDTO> criar(@Valid @RequestBody PastoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pastoService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<PastoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(pastoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PastoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pastoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PastoResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody PastoRequestDTO request
    ) {
        return ResponseEntity.ok(pastoService.atualizar(id, request));
    }

    @PatchMapping("/{id}/desativar")
    public ResponseEntity<PastoResponseDTO> desativar(@PathVariable Long id) {
        return ResponseEntity.ok(pastoService.desativar(id));
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<PastoResponseDTO> ativar(@PathVariable Long id) {
        return ResponseEntity.ok(pastoService.ativar(id));
    }
}
