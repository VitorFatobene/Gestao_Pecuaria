package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.dto.AnimalResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/animais")
@RequiredArgsConstructor
public class AnimalController {

    private final AnimalService animalService;

    @PostMapping
    public ResponseEntity<AnimalResponseDTO> criar(@Valid @RequestBody AnimalRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(animalService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<AnimalResponseDTO>> listarTodos() {
        return ResponseEntity.ok(animalService.listarTodos());
    }

    @GetMapping("/pasto/{pastoId}")
    public ResponseEntity<List<AnimalResponseDTO>> listarPorPasto(@PathVariable Long pastoId) {
        return ResponseEntity.ok(animalService.listarPorPasto(pastoId));
    }

    @GetMapping("/data-compra")
    public ResponseEntity<List<AnimalResponseDTO>> listarPorDataCompra(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(animalService.listarPorDataCompra(inicio, fim));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(animalService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnimalResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AnimalRequestDTO request
    ) {
        return ResponseEntity.ok(animalService.atualizar(id, request));
    }

    @PatchMapping("/{id}/alterar-pasto/{pastoId}")
    public ResponseEntity<AnimalResponseDTO> alterarPasto(
            @PathVariable Long id,
            @PathVariable Long pastoId
    ) {
        return ResponseEntity.ok(animalService.alterarPasto(id, pastoId));
    }

    @PatchMapping("/{id}/remover-pasto")
    public ResponseEntity<AnimalResponseDTO> removerPasto(@PathVariable Long id) {
        return ResponseEntity.ok(animalService.removerPasto(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        animalService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
