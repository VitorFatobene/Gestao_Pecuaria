package gestao.pecuaria.backend.usuario;

import gestao.pecuaria.backend.usuario.dto.AtualizarPerfilRequestDTO;
import gestao.pecuaria.backend.usuario.dto.PerfilUsuarioResponseDTO;
import gestao.pecuaria.backend.usuario.dto.UsuarioRequestDTO;
import gestao.pecuaria.backend.usuario.dto.UsuarioResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@Tag(name = "Usuários", description = "Cadastro público inicial e administração de usuários do sistema.")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Operation(summary = "Cadastra usuário", description = "Cria um usuário do sistema. Esta rota é pública para permitir o cadastro inicial.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuário cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou e-mail já cadastrado")
    })
    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> criar(@Valid @RequestBody UsuarioRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.criar(request));
    }

    @Operation(summary = "Lista usuários", description = "Retorna todos os usuários cadastrados.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuários listados com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @Operation(summary = "Busca usuário autenticado", description = "Retorna os dados públicos do usuário autenticado pelo token JWT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário autenticado retornado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @GetMapping("/me")
    public ResponseEntity<PerfilUsuarioResponseDTO> buscarUsuarioAutenticado(Authentication authentication) {
        return ResponseEntity.ok(usuarioService.buscarUsuarioAutenticado(authentication));
    }

    @Operation(summary = "Atualiza usuário autenticado", description = "Atualiza os dados do usuário autenticado pelo token JWT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário autenticado atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou e-mail já cadastrado"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido")
    })
    @PutMapping("/me")
    public ResponseEntity<PerfilUsuarioResponseDTO> atualizarUsuarioAutenticado(
            Authentication authentication,
            @Valid @RequestBody AtualizarPerfilRequestDTO request
    ) {
        return ResponseEntity.ok(usuarioService.atualizarUsuarioAutenticado(authentication, request));
    }

    @Operation(summary = "Busca usuário por ID", description = "Retorna os dados públicos de um usuário.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(
            @Parameter(description = "ID do usuário", example = "1")
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @Operation(summary = "Atualiza usuário", description = "Atualiza nome, e-mail e senha de um usuário cadastrado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou e-mail já cadastrado"),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente, expirado ou inválido"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> atualizar(
            @Parameter(description = "ID do usuário", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequestDTO request
    ) {
        return ResponseEntity.ok(usuarioService.atualizar(id, request));
    }
}
