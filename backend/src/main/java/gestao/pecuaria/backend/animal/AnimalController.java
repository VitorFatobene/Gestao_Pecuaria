package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.dto.AnimalResponseDTO;
import gestao.pecuaria.backend.animal.dto.LocalizacaoAnimalDTO;
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
@RequestMapping("/animais")
@Tag(name = "Animais", description = "Cadastro, consulta, movimentação entre pastos e inativação de animais.")
@RequiredArgsConstructor
public class AnimalController {

    private final AnimalService animalService;

    @Operation(
            summary = "Cadastra um animal",
            description = "Cadastra um novo animal comprado pela propriedade, opcionalmente vinculado a um pasto existente."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Animal cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Pasto informado não encontrado")
    })
    @PostMapping
    public ResponseEntity<AnimalResponseDTO> criar(@Valid @RequestBody AnimalRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(animalService.criar(request));
    }

    @Operation(
            summary = "Lista todos os animais",
            description = "Retorna todos os animais cadastrados, incluindo ativos, vendidos e inativos."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Animais listados com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping
    public ResponseEntity<List<AnimalResponseDTO>> listarTodos() {
        return ResponseEntity.ok(animalService.listarTodos());
    }

    @Operation(
            summary = "Lista animais por pasto",
            description = "Retorna os animais vinculados ao pasto informado."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Animais do pasto listados com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping("/pasto/{pastoId}")
    public ResponseEntity<List<AnimalResponseDTO>> listarPorPasto(
            @Parameter(description = "ID do pasto", example = "1")
            @PathVariable Long pastoId
    ) {
        return ResponseEntity.ok(animalService.listarPorPasto(pastoId));
    }

    @Operation(
            summary = "Lista animais por período de compra",
            description = "Retorna animais comprados dentro do intervalo informado, usando datas no formato ISO yyyy-MM-dd."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Animais do período listados com sucesso"),
            @ApiResponse(responseCode = "400", description = "Parâmetros de data inválidos"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping("/data-compra")
    public ResponseEntity<List<AnimalResponseDTO>> listarPorDataCompra(
            @Parameter(description = "Data inicial da compra", example = "2026-01-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @Parameter(description = "Data final da compra", example = "2026-01-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(animalService.listarPorDataCompra(inicio, fim));
    }

    @Operation(summary = "Busca animal por ID", description = "Retorna os dados detalhados de um animal.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Animal encontrado"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Animal não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<AnimalResponseDTO> buscarPorId(
            @Parameter(description = "ID do animal", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(animalService.buscarPorId(id));
    }

    @Operation(summary = "Busca localizacao atual do animal", description = "Retorna o pasto atual e o tempo de permanencia do animal.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Localizacao atual retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Animal não encontrado")
    })
    @GetMapping("/{id}/localizacao")
    public ResponseEntity<LocalizacaoAnimalDTO> buscarLocalizacaoAtual(
            @Parameter(description = "ID do animal", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(animalService.buscarLocalizacaoAtual(id));
    }

    @Operation(summary = "Atualiza animal", description = "Atualiza os dados cadastrais e financeiros de um animal.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Animal atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Animal ou pasto não encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<AnimalResponseDTO> atualizar(
            @Parameter(description = "ID do animal", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody AnimalRequestDTO request
    ) {
        return ResponseEntity.ok(animalService.atualizar(id, request));
    }

    @Operation(summary = "Altera o pasto do animal", description = "Move um animal para outro pasto cadastrado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pasto do animal alterado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Animal ou pasto não encontrado")
    })
    @PatchMapping("/{id}/alterar-pasto/{pastoId}")
    public ResponseEntity<AnimalResponseDTO> alterarPasto(
            @Parameter(description = "ID do animal", example = "1")
            @PathVariable Long id,
            @Parameter(description = "ID do novo pasto", example = "2")
            @PathVariable Long pastoId
    ) {
        return ResponseEntity.ok(animalService.alterarPasto(id, pastoId));
    }

    @Operation(summary = "Remove animal do pasto", description = "Remove o vínculo do animal com qualquer pasto.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Vínculo com pasto removido com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Animal não encontrado")
    })
    @PatchMapping("/{id}/remover-pasto")
    public ResponseEntity<AnimalResponseDTO> removerPasto(
            @Parameter(description = "ID do animal", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(animalService.removerPasto(id));
    }

    @Operation(summary = "Inativa animal", description = "Marca um animal como inativo sem remover o registro do banco.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Animal inativado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Animal não encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID do animal", example = "1")
            @PathVariable Long id
    ) {
        animalService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
