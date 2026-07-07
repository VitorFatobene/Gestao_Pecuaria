package gestao.pecuaria.backend.venda;

import gestao.pecuaria.backend.venda.dto.VendaRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/vendas")
@RequiredArgsConstructor
public class VendaController {

    private final VendaService vendaService;

    @PostMapping
    public ResponseEntity<VendaResponseDTO> criar(@Valid @RequestBody VendaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vendaService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<VendaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(vendaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(vendaService.buscarPorId(id));
    }

    @GetMapping("/animal/{animalId}")
    public ResponseEntity<VendaResponseDTO> buscarPorAnimal(@PathVariable Long animalId) {
        return ResponseEntity.ok(vendaService.buscarPorAnimal(animalId));
    }

    @GetMapping("/data-venda")
    public ResponseEntity<List<VendaResponseDTO>> listarPorDataVenda(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(vendaService.listarPorDataVenda(inicio, fim));
    }
}
