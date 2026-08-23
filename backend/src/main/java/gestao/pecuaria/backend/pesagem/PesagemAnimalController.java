package gestao.pecuaria.backend.pesagem;

import gestao.pecuaria.backend.pesagem.dto.PesagemAnimalRequestDTO;
import gestao.pecuaria.backend.pesagem.dto.PesagemAnimalResponseDTO;
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
@RequestMapping("/animais/{animalId}/pesagens")
@Tag(name = "Pesagens de animais", description = "Registro e consulta do histórico de pesagens dos animais.")
@RequiredArgsConstructor
public class PesagemAnimalController {

    private final PesagemAnimalService pesagemAnimalService;

    @Operation(summary = "Registra uma nova pesagem", description = "Cria um registro histórico de pesagem e atualiza o peso atual do animal.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pesagem registrada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Animal não encontrado")
    })
    @PostMapping
    public ResponseEntity<PesagemAnimalResponseDTO> registrar(
            @Parameter(description = "ID do animal", example = "1")
            @PathVariable Long animalId,
            @Valid @RequestBody PesagemAnimalRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pesagemAnimalService.registrar(animalId, request));
    }

    @Operation(summary = "Lista o histórico de pesagens", description = "Retorna as pesagens do animal ordenadas pela data mais recente.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Histórico de pesagens retornado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Animal não encontrado")
    })
    @GetMapping
    public ResponseEntity<List<PesagemAnimalResponseDTO>> listarHistorico(
            @Parameter(description = "ID do animal", example = "1")
            @PathVariable Long animalId
    ) {
        return ResponseEntity.ok(pesagemAnimalService.listarHistorico(animalId));
    }
}
