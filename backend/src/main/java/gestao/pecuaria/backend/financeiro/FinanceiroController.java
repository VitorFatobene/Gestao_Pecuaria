package gestao.pecuaria.backend.financeiro;

import gestao.pecuaria.backend.financeiro.dto.FinanceiroResumoDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/financeiro")
@Tag(name = "Financeiro", description = "Indicadores financeiros consolidados da propriedade.")
@RequiredArgsConstructor
public class FinanceiroController {

    private final FinanceiroService financeiroService;

    @Operation(
            summary = "Gera resumo financeiro",
            description = "Consolida totais de gastos, ganhos, lucro, animais, pastos e vendas registradas."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resumo financeiro gerado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping("/resumo")
    public ResponseEntity<FinanceiroResumoDTO> gerarResumo() {
        return ResponseEntity.ok(financeiroService.gerarResumo());
    }
}
