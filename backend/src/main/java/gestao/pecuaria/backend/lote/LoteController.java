package gestao.pecuaria.backend.lote;

import gestao.pecuaria.backend.lote.dto.AdicionarAnimaisLoteRequestDTO;
import gestao.pecuaria.backend.lote.dto.LoteRequestDTO;
import gestao.pecuaria.backend.lote.dto.LoteResponseDTO;
import gestao.pecuaria.backend.lote.enums.StatusLote;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/lotes")
@Tag(name = "Lotes", description = "Cadastro e controle de lotes de animais para agrupamentos futuros.")
@RequiredArgsConstructor
public class LoteController {

    private final LoteService loteService;

    @Operation(summary = "Cadastra um lote", description = "Cria um lote aberto, inicialmente sem animais associados.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Lote cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados invalidos"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou invalido")
    })
    @PostMapping
    public ResponseEntity<LoteResponseDTO> criar(@Valid @RequestBody LoteRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loteService.criar(request));
    }

    @Operation(summary = "Lista lotes", description = "Retorna todos os lotes cadastrados, opcionalmente filtrados por status.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lotes listados com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou invalido")
    })
    @GetMapping
    public ResponseEntity<List<LoteResponseDTO>> listarTodos(
            @Parameter(description = "Status opcional para filtro.", example = "ABERTO")
            @RequestParam(required = false) StatusLote status
    ) {
        return ResponseEntity.ok(loteService.listarTodos(status));
    }

    @Operation(summary = "Busca lote por ID", description = "Retorna os dados de um lote especifico.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lote encontrado"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou invalido"),
            @ApiResponse(responseCode = "404", description = "Lote nao encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<LoteResponseDTO> buscarPorId(
            @Parameter(description = "ID do lote", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(loteService.buscarPorId(id));
    }

    @Operation(summary = "Atualiza lote", description = "Atualiza nome e descricao do lote.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lote atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados invalidos"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou invalido"),
            @ApiResponse(responseCode = "404", description = "Lote nao encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<LoteResponseDTO> atualizar(
            @Parameter(description = "ID do lote", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody LoteRequestDTO request
    ) {
        return ResponseEntity.ok(loteService.atualizar(id, request));
    }

    @Operation(summary = "Cancela lote", description = "Marca um lote como cancelado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lote cancelado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou invalido"),
            @ApiResponse(responseCode = "404", description = "Lote nao encontrado")
    })
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<LoteResponseDTO> cancelar(
            @Parameter(description = "ID do lote", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(loteService.cancelar(id));
    }

    @Operation(summary = "Adiciona animais ao lote", description = "Associa animais ativos e disponiveis a um lote aberto.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Animais associados ao lote com sucesso"),
            @ApiResponse(responseCode = "400", description = "Animais invalidos ou lote indisponivel"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou invalido"),
            @ApiResponse(responseCode = "404", description = "Lote ou animal nao encontrado")
    })
    @PatchMapping("/{id}/adicionar-animais")
    public ResponseEntity<LoteResponseDTO> adicionarAnimais(
            @Parameter(description = "ID do lote", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody AdicionarAnimaisLoteRequestDTO request
    ) {
        return ResponseEntity.ok(loteService.adicionarAnimais(id, request));
    }

    @Operation(summary = "Exclui lote", description = "Remove o lote apenas quando nao houver animais associados.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Lote excluido com sucesso"),
            @ApiResponse(responseCode = "400", description = "Lote possui animais associados"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou invalido"),
            @ApiResponse(responseCode = "404", description = "Lote nao encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @Parameter(description = "ID do lote", example = "1")
            @PathVariable Long id
    ) {
        loteService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
