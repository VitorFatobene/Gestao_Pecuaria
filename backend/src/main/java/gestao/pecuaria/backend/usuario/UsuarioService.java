package gestao.pecuaria.backend.usuario;

import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.usuario.dto.AtualizarPerfilRequestDTO;
import gestao.pecuaria.backend.usuario.dto.PerfilUsuarioResponseDTO;
import gestao.pecuaria.backend.usuario.dto.UsuarioRequestDTO;
import gestao.pecuaria.backend.usuario.dto.UsuarioResponseDTO;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private static final String EMAIL_EM_USO = "O e-mail informado já está em uso.";
    private static final int TAMANHO_MINIMO_SENHA = 6;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Transactional
    public UsuarioResponseDTO criar(UsuarioRequestDTO request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException(EMAIL_EM_USO);
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setSobrenome(request.sobrenome());
        usuario.setTelefone(request.telefone());
        usuario.setCidade(request.cidade());
        usuario.setEstado(request.estado().toUpperCase());
        usuario.setEmail(request.email());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setNomePropriedadeRural(request.nomePropriedadeRural());
        usuario.setRole(Role.USER);

        Usuario usuarioSalvo = usuarioRepository.saveAndFlush(usuario);
        entityManager.refresh(usuarioSalvo);

        return toResponseDTO(usuarioSalvo);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        return toResponseDTO(buscarEntidadePorId(id));
    }

    @Transactional(readOnly = true)
    public PerfilUsuarioResponseDTO buscarUsuarioAutenticado(Authentication authentication) {
        return toPerfilResponseDTO(buscarEntidadePorEmail(authentication.getName()));
    }

    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioRequestDTO request) {
        Usuario usuario = buscarEntidadePorId(id);
        atualizarDadosEditaveis(usuario, request, id);

        return toResponseDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public PerfilUsuarioResponseDTO atualizarUsuarioAutenticado(Authentication authentication, AtualizarPerfilRequestDTO request) {
        Usuario usuario = buscarEntidadePorEmail(authentication.getName());
        atualizarDadosPerfil(usuario, request);

        return toPerfilResponseDTO(usuarioRepository.save(usuario));
    }

    private void atualizarDadosEditaveis(Usuario usuario, UsuarioRequestDTO request, Long idIgnoradoNaValidacaoEmail) {
        if (usuarioRepository.existsByEmailAndIdNot(request.email(), idIgnoradoNaValidacaoEmail)) {
            throw new IllegalArgumentException(EMAIL_EM_USO);
        }

        usuario.setNome(request.nome());
        usuario.setSobrenome(request.sobrenome());
        usuario.setTelefone(request.telefone());
        usuario.setCidade(request.cidade());
        usuario.setEstado(request.estado().toUpperCase());
        usuario.setEmail(request.email());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setNomePropriedadeRural(request.nomePropriedadeRural());
    }

    private void atualizarDadosPerfil(Usuario usuario, AtualizarPerfilRequestDTO request) {
        usuario.setNome(request.nome().trim());
        usuario.setNomePropriedadeRural(request.nomeFazenda().trim());

        String novaSenha = normalizarCampoOpcional(request.novaSenha());

        if (novaSenha == null) {
            return;
        }

        String senhaAtual = normalizarCampoOpcional(request.senhaAtual());
        String confirmacaoNovaSenha = normalizarCampoOpcional(request.confirmacaoNovaSenha());

        if (senhaAtual == null) {
            throw new IllegalArgumentException("Informe a senha atual para alterar a senha.");
        }

        if (confirmacaoNovaSenha == null) {
            throw new IllegalArgumentException("Confirme a nova senha.");
        }

        if (novaSenha.length() < TAMANHO_MINIMO_SENHA) {
            throw new IllegalArgumentException("A nova senha deve ter no mínimo 6 caracteres.");
        }

        if (!novaSenha.equals(confirmacaoNovaSenha)) {
            throw new IllegalArgumentException("As novas senhas não coincidem.");
        }

        if (!passwordEncoder.matches(senhaAtual, usuario.getSenha())) {
            throw new IllegalArgumentException("Senha atual incorreta.");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
    }

    private String normalizarCampoOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor;
    }

    @Transactional(readOnly = true)
    public Usuario buscarEntidadePorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
    }

    public Usuario buscarEntidadePorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com e-mail: " + email));
    }

    public UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getSobrenome(),
                usuario.getTelefone(),
                usuario.getCidade(),
                usuario.getEstado(),
                usuario.getEmail(),
                usuario.getNomePropriedadeRural(),
                usuario.getRole(),
                usuario.getCriadoEm()
        );
    }

    public PerfilUsuarioResponseDTO toPerfilResponseDTO(Usuario usuario) {
        return new PerfilUsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getNomePropriedadeRural(),
                usuario.getRole()
        );
    }
}
