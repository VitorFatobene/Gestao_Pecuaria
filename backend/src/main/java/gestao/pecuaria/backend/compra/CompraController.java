package gestao.pecuaria.backend.compra;

import gestao.pecuaria.backend.compra.dto.CompraRequestDTO;
import gestao.pecuaria.backend.compra.dto.CompraResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/compras")
@Tag(name = "Compras", description = "Cadastro e consulta de negociações de aquisição de animais.")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @Operation(summary = "Cadastra uma compra", description = "Cria uma negociação de aquisição de animais para o usuário autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Compra cadastrada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados invalidos"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou invalido")
    })
    @PostMapping
    public ResponseEntity<CompraResponseDTO> criar(@Valid @RequestBody CompraRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(compraService.criar(request));
    }

    @Operation(summary = "Lista compras", description = "Retorna todas as compras do usuário autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Compras listadas com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou invalido")
    })
    @GetMapping
    public ResponseEntity<List<CompraResponseDTO>> listarTodos() {
        return ResponseEntity.ok(compraService.listarTodos());
    }

    @Operation(summary = "Busca compra por ID", description = "Retorna os dados de uma compra específica do usuário autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Compra encontrada"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou invalido"),
            @ApiResponse(responseCode = "404", description = "Compra nao encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<CompraResponseDTO> buscarPorId(
            @Parameter(description = "ID da compra", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(compraService.buscarPorId(id));
    }
}
