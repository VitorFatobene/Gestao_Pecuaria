package gestao.pecuaria.backend.cotacao.controller;

import gestao.pecuaria.backend.cotacao.dto.CotacaoBoiResponseDTO;
import gestao.pecuaria.backend.cotacao.service.CotacaoService;
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
@RequestMapping("/cotacao")
@Tag(name = "Cotação", description = "Consulta de cotação externa com cache Redis.")
@RequiredArgsConstructor
public class CotacaoController {

    private final CotacaoService cotacaoService;

    @Operation(
            summary = "Obtém cotação atual do boi",
            description = "Retorna a cotação da arroba do boi para a UF configurada, usando Redis com Cache Aside Pattern."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cotação retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "503", description = "Cotação indisponível")
    })
    @GetMapping("/boi")
    public ResponseEntity<CotacaoBoiResponseDTO> obterCotacaoBoi() {
        return ResponseEntity.ok(cotacaoService.obterCotacaoBoi());
    }
}
