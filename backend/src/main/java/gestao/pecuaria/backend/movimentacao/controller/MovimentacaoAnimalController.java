package gestao.pecuaria.backend.movimentacao.controller;

import gestao.pecuaria.backend.movimentacao.dto.MovimentacaoAnimalResponseDTO;
import gestao.pecuaria.backend.movimentacao.service.MovimentacaoAnimalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/movimentacoes")
@Tag(name = "Movimentacoes", description = "Consulta geral do historico de movimentacoes de animais entre pastos.")
@RequiredArgsConstructor
public class MovimentacaoAnimalController {

    private final MovimentacaoAnimalService movimentacaoAnimalService;

    @Operation(summary = "Lista movimentacoes dos animais", description = "Retorna o historico geral com filtros opcionais por animal, pasto e periodo de entrada.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Movimentacoes listadas com sucesso"),
            @ApiResponse(responseCode = "400", description = "Filtros invalidos"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou invalido")
    })
    @GetMapping
    public ResponseEntity<List<MovimentacaoAnimalResponseDTO>> listarMovimentacoes(
            @Parameter(description = "ID do animal", example = "10")
            @RequestParam(required = false) Long animalId,
            @Parameter(description = "ID do pasto", example = "3")
            @RequestParam(required = false) Long pastoId,
            @Parameter(description = "Data inicial de entrada", example = "2026-08-01")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @Parameter(description = "Data final de entrada", example = "2026-08-31")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(movimentacaoAnimalService.buscarMovimentacoes(animalId, pastoId, inicio, fim));
    }
}
