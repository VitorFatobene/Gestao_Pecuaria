package gestao.pecuaria.backend.venda;

import gestao.pecuaria.backend.venda.dto.VendaRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Vendas", description = "Registro e consulta das vendas de animais da propriedade.")
@RequiredArgsConstructor
public class VendaController {

    private final VendaService vendaService;

    @Operation(summary = "Registra uma venda", description = "Registra a venda de um animal ativo, com comprador, valor, data e peso no momento da venda.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Venda registrada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou animal indisponível para venda"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Animal não encontrado")
    })
    @PostMapping
    public ResponseEntity<VendaResponseDTO> criar(@Valid @RequestBody VendaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vendaService.criar(request));
    }

    @Operation(summary = "Lista todas as vendas", description = "Retorna todas as vendas registradas.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Vendas listadas com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping
    public ResponseEntity<List<VendaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(vendaService.listarTodos());
    }

    @Operation(summary = "Busca venda por ID", description = "Retorna os dados de uma venda específica.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venda encontrada"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Venda não encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<VendaResponseDTO> buscarPorId(
            @Parameter(description = "ID da venda", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(vendaService.buscarPorId(id));
    }

    @Operation(summary = "Busca venda por animal", description = "Retorna a venda vinculada ao animal informado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venda do animal encontrada"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Venda não encontrada para o animal")
    })
    @GetMapping("/animal/{animalId}")
    public ResponseEntity<VendaResponseDTO> buscarPorAnimal(
            @Parameter(description = "ID do animal vendido", example = "1")
            @PathVariable Long animalId
    ) {
        return ResponseEntity.ok(vendaService.buscarPorAnimal(animalId));
    }

    @Operation(
            summary = "Lista vendas por período",
            description = "Retorna vendas realizadas dentro do intervalo informado, usando datas no formato ISO yyyy-MM-dd."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Vendas do período listadas com sucesso"),
            @ApiResponse(responseCode = "400", description = "Parâmetros de data inválidos"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping("/data-venda")
    public ResponseEntity<List<VendaResponseDTO>> listarPorDataVenda(
            @Parameter(description = "Data inicial da venda", example = "2026-03-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @Parameter(description = "Data final da venda", example = "2026-03-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(vendaService.listarPorDataVenda(inicio, fim));
    }
}
