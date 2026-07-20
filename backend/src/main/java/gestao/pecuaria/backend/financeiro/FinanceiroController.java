package gestao.pecuaria.backend.financeiro;

import gestao.pecuaria.backend.financeiro.dto.FinanceiroResumoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/financeiro")
@RequiredArgsConstructor
public class FinanceiroController {

    private final FinanceiroService financeiroService;

    @GetMapping("/resumo")
    public ResponseEntity<FinanceiroResumoDTO> gerarResumo() {
        return ResponseEntity.ok(financeiroService.gerarResumo());
    }
}
