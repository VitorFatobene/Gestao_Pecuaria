package gestao.pecuaria.backend.contapagar.controller;

import gestao.pecuaria.backend.contapagar.dto.ContaPagarResponseDTO;
import gestao.pecuaria.backend.contapagar.dto.ContaPagarResumoDTO;
import gestao.pecuaria.backend.contapagar.dto.CriarContaPagarRequestDTO;
import gestao.pecuaria.backend.contapagar.dto.RegistrarPagamentoParcelaRequestDTO;
import gestao.pecuaria.backend.contapagar.enums.CategoriaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusContaPagar;
import gestao.pecuaria.backend.contapagar.service.ContaPagarService;
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
@RequestMapping("/contas-pagar")
@Tag(name = "Contas a pagar", description = "Controle de despesas, parcelas, vencimentos e pagamentos.")
@RequiredArgsConstructor
public class ContaPagarController {

    private final ContaPagarService contaPagarService;

    @Operation(summary = "Cria uma conta a pagar e suas parcelas")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Conta criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados ou condição de pagamento inválidos"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado")
    })
    @PostMapping
    public ResponseEntity<ContaPagarResponseDTO> criar(
            @Valid @RequestBody CriarContaPagarRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contaPagarService.criar(request));
    }

    @Operation(
            summary = "Lista contas a pagar",
            description = "Os parâmetros inicio e fim filtram pelo vencimento das parcelas. A ordenação usa o vencimento pendente mais próximo, incluindo vencidas antes das futuras."
    )
    @GetMapping
    public ResponseEntity<List<ContaPagarResponseDTO>> listar(
            @RequestParam(required = false) StatusContaPagar status,
            @RequestParam(required = false) CategoriaContaPagar categoria,
            @RequestParam(required = false) String fornecedor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(contaPagarService.listar(status, categoria, fornecedor, inicio, fim));
    }

    @Operation(summary = "Retorna o resumo financeiro de contas a pagar")
    @GetMapping("/resumo")
    public ResponseEntity<ContaPagarResumoDTO> buscarResumo() {
        return ResponseEntity.ok(contaPagarService.buscarResumo());
    }

    @Operation(summary = "Detalha uma conta a pagar e suas parcelas")
    @GetMapping("/{id}")
    public ResponseEntity<ContaPagarResponseDTO> buscarPorId(
            @Parameter(description = "ID da conta a pagar", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(contaPagarService.buscarPorId(id));
    }

    @Operation(summary = "Registra o pagamento de uma parcela")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pagamento registrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Parcela paga, cancelada ou dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Parcela não encontrada")
    })
    @PatchMapping("/parcelas/{parcelaId}/pagar")
    public ResponseEntity<ContaPagarResponseDTO> registrarPagamento(
            @PathVariable Long parcelaId,
            @Valid @RequestBody RegistrarPagamentoParcelaRequestDTO request
    ) {
        return ResponseEntity.ok(contaPagarService.registrarPagamento(parcelaId, request));
    }

    @Operation(summary = "Cancela logicamente uma conta a pagar")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Conta cancelada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Conta totalmente paga não pode ser cancelada"),
            @ApiResponse(responseCode = "404", description = "Conta não encontrada")
    })
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ContaPagarResponseDTO> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(contaPagarService.cancelar(id));
    }
}
