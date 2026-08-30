package gestao.pecuaria.backend.usuario;

import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
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
    public UsuarioResponseDTO buscarUsuarioAutenticado(Authentication authentication) {
        return toResponseDTO(buscarEntidadePorEmail(authentication.getName()));
    }

    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioRequestDTO request) {
        Usuario usuario = buscarEntidadePorId(id);
        atualizarDadosEditaveis(usuario, request, id);

        return toResponseDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponseDTO atualizarUsuarioAutenticado(Authentication authentication, UsuarioRequestDTO request) {
        Usuario usuario = buscarEntidadePorEmail(authentication.getName());
        atualizarDadosEditaveis(usuario, request, usuario.getId());

        return toResponseDTO(usuarioRepository.save(usuario));
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
}
