package gestao.pecuaria.backend.dashboard.controller;

import gestao.pecuaria.backend.dashboard.dto.DashboardManejoDTO;
import gestao.pecuaria.backend.dashboard.dto.DashboardResponseDTO;
import gestao.pecuaria.backend.dashboard.service.DashboardManejoService;
import gestao.pecuaria.backend.dashboard.service.DashboardService;
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
@RequestMapping("/dashboard")
@Tag(name = "Dashboard", description = "Métricas e dados consolidados para o painel principal")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final DashboardManejoService dashboardManejoService;

    @Operation(
            summary = "Obtém dados do dashboard",
            description = "Retorna indicadores consolidados, animais em destaque e movimentações recentes."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados do dashboard retornados com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping
    public ResponseEntity<DashboardResponseDTO> obterDadosDashboard() {
        return ResponseEntity.ok(dashboardService.obterDadosDashboard());
    }

    @Operation(
            summary = "Obtém indicadores de manejo",
            description = "Retorna indicadores de ocupação, permanência e rotação de pastagens."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Indicadores de manejo retornados com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping("/manejo")
    public ResponseEntity<DashboardManejoDTO> obterIndicadoresManejo() {
        return ResponseEntity.ok(dashboardManejoService.buscarResumoManejo());
    }
}