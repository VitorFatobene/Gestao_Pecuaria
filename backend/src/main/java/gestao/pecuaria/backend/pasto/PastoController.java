package gestao.pecuaria.backend.pasto;

import gestao.pecuaria.backend.pasto.dto.AnimalNoPastoDTO;
import gestao.pecuaria.backend.pasto.dto.PastoRequestDTO;
import gestao.pecuaria.backend.pasto.dto.PastoResponseDTO;
import gestao.pecuaria.backend.pasto.dto.PastoDetalhesDTO;
import gestao.pecuaria.backend.pasto.dto.PastoOcupacaoDTO;
import gestao.pecuaria.backend.pasto.dto.PastoResumoDTO;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/pastos")
@Tag(name = "Pastos", description = "Cadastro, consulta e controle de disponibilidade dos pastos da propriedade.")
@RequiredArgsConstructor
public class PastoController {

    private final PastoService pastoService;

    @Operation(summary = "Cadastra um pasto", description = "Cria um pasto com nome, área em hectares, descrição e status de atividade.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pasto cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @PostMapping
    public ResponseEntity<PastoResponseDTO> criar(@Valid @RequestBody PastoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pastoService.criar(request));
    }

    @Operation(summary = "Lista todos os pastos", description = "Retorna todos os pastos cadastrados, ativos e inativos.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pastos listados com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping
    public ResponseEntity<List<PastoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(pastoService.listarTodos());
    }

    @Operation(summary = "Lista resumo operacional dos pastos", description = "Retorna dados calculados de ocupação dos pastos.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resumo dos pastos listado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping("/resumo")
    public ResponseEntity<List<PastoResumoDTO>> listarResumo() {
        return ResponseEntity.ok(pastoService.listarResumo());
    }

    @Operation(summary = "Busca detalhes operacionais do pasto", description = "Retorna resumo do pasto e agregações dos animais alocados.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Detalhes do pasto retornados com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Pasto não encontrado")
    })
    @GetMapping("/{id}/detalhes")
    public ResponseEntity<PastoDetalhesDTO> buscarDetalhes(
            @Parameter(description = "ID do pasto", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(pastoService.buscarDetalhes(id));
    }

    @Operation(summary = "Busca ocupacao atual do pasto", description = "Retorna quantidade atual de animais e indicadores de permanencia.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ocupacao do pasto retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Pasto não encontrado")
    })
    @GetMapping("/{id}/ocupacao")
    public ResponseEntity<PastoOcupacaoDTO> buscarOcupacao(
            @Parameter(description = "ID do pasto", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(pastoService.buscarOcupacaoPasto(id));
    }

    @Operation(summary = "Lista animais atuais do pasto", description = "Retorna somente os animais com movimentacao aberta no pasto.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Animais atuais do pasto retornados com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Pasto não encontrado")
    })
    @GetMapping("/{id}/animais")
    public ResponseEntity<List<AnimalNoPastoDTO>> listarAnimaisAtuais(
            @Parameter(description = "ID do pasto", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(pastoService.buscarAnimaisAtuaisDoPasto(id));
    }

    @Operation(summary = "Busca pasto por ID", description = "Retorna os dados de um pasto específico.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pasto encontrado"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Pasto não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<PastoResponseDTO> buscarPorId(
            @Parameter(description = "ID do pasto", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(pastoService.buscarPorId(id));
    }

    @Operation(summary = "Atualiza pasto", description = "Atualiza nome, área, descrição e status do pasto.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pasto atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Pasto não encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<PastoResponseDTO> atualizar(
            @Parameter(description = "ID do pasto", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody PastoRequestDTO request
    ) {
        return ResponseEntity.ok(pastoService.atualizar(id, request));
    }

    @Operation(summary = "Desativa pasto", description = "Marca um pasto como inativo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pasto desativado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Pasto não encontrado")
    })
    @PatchMapping("/{id}/desativar")
    public ResponseEntity<PastoResponseDTO> desativar(
            @Parameter(description = "ID do pasto", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(pastoService.desativar(id));
    }

    @Operation(summary = "Ativa pasto", description = "Marca um pasto como ativo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pasto ativado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Pasto não encontrado")
    })
    @PatchMapping("/{id}/ativar")
    public ResponseEntity<PastoResponseDTO> ativar(
            @Parameter(description = "ID do pasto", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(pastoService.ativar(id));
    }
}
