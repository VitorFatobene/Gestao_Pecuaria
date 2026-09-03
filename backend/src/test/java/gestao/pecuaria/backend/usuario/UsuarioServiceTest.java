package gestao.pecuaria.backend.usuario;

import gestao.pecuaria.backend.usuario.dto.AtualizarPerfilRequestDTO;
import gestao.pecuaria.backend.usuario.dto.PerfilUsuarioResponseDTO;
import gestao.pecuaria.backend.usuario.dto.UsuarioRequestDTO;
import gestao.pecuaria.backend.usuario.dto.UsuarioResponseDTO;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    void deveCriarUsuarioComSenhaCriptografada() {
        UsuarioRequestDTO request = new UsuarioRequestDTO(
                "Administrador",
                "Silva",
                "(11) 99999-9999",
                "Ribeirão Preto",
                "SP",
                "admin@email.com",
                "123456",
                "Fazenda Boa Vista"
        );

        when(usuarioRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.senha())).thenReturn("$2a$hash");
        when(usuarioRepository.saveAndFlush(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario usuario = invocation.getArgument(0);
            usuario.setId(1L);
            usuario.setCriadoEm(LocalDateTime.of(2026, 7, 20, 15, 0));
            return usuario;
        });

        UsuarioResponseDTO response = usuarioService.criar(request);

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).saveAndFlush(captor.capture());
        verify(entityManager).refresh(captor.getValue());

        assertThat(captor.getValue().getSenha()).isEqualTo("$2a$hash");
        assertThat(captor.getValue().getSenha()).isNotEqualTo("123456");
        assertThat(captor.getValue().getRole()).isEqualTo(Role.USER);
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.nome()).isEqualTo("Administrador");
        assertThat(response.sobrenome()).isEqualTo("Silva");
        assertThat(response.telefone()).isEqualTo("(11) 99999-9999");
        assertThat(response.cidade()).isEqualTo("Ribeirão Preto");
        assertThat(response.estado()).isEqualTo("SP");
        assertThat(response.email()).isEqualTo("admin@email.com");
        assertThat(response.nomePropriedadeRural()).isEqualTo("Fazenda Boa Vista");
        assertThat(response.role()).isEqualTo(Role.USER);
    }

    @Test
    void deveFalharAoCriarUsuarioComEmailDuplicado() {
        UsuarioRequestDTO request = new UsuarioRequestDTO(
                "Administrador",
                "Silva",
                "(11) 99999-9999",
                "Ribeirão Preto",
                "SP",
                "admin@email.com",
                "123456",
                "Fazenda Boa Vista"
        );

        when(usuarioRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("O e-mail informado já está em uso.");
    }

    @Test
    void naoDeveAlterarRoleAoAtualizarUsuarioAutenticado() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("Usuario");
        usuario.setEmail("user@email.com");
        usuario.setSenha("$2a$old");
        usuario.setRole(Role.USER);

        AtualizarPerfilRequestDTO request = new AtualizarPerfilRequestDTO(
                "Usuario",
                "Fazenda Boa Vista",
                "senhaAtual",
                "novaSenha",
                "novaSenha"
        );

        org.springframework.security.core.Authentication authentication =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("user@email.com", null);

        when(usuarioRepository.findByEmail("user@email.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senhaAtual", "$2a$old")).thenReturn(true);
        when(passwordEncoder.encode(request.novaSenha())).thenReturn("$2a$new");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PerfilUsuarioResponseDTO response = usuarioService.atualizarUsuarioAutenticado(authentication, request);

        assertThat(response.role()).isEqualTo(Role.USER);
        assertThat(response.nomeFazenda()).isEqualTo("Fazenda Boa Vista");
        assertThat(usuario.getRole()).isEqualTo(Role.USER);
        assertThat(usuario.getSenha()).isEqualTo("$2a$new");
        verify(passwordEncoder).matches("senhaAtual", "$2a$old");
        verify(usuarioRepository).findByEmail("user@email.com");
    }

    @Test
    void deveRejeitarSenhaAtualIncorretaAoAtualizarPerfil() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("Usuario");
        usuario.setEmail("user@email.com");
        usuario.setSenha("$2a$old");
        usuario.setNomePropriedadeRural("Fazenda Antiga");
        usuario.setRole(Role.USER);

        AtualizarPerfilRequestDTO request = new AtualizarPerfilRequestDTO(
                "Usuario",
                "Fazenda Boa Vista",
                "senhaErrada",
                "novaSenha",
                "novaSenha"
        );

        org.springframework.security.core.Authentication authentication =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("user@email.com", null);

        when(usuarioRepository.findByEmail("user@email.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senhaErrada", "$2a$old")).thenReturn(false);

        assertThatThrownBy(() -> usuarioService.atualizarUsuarioAutenticado(authentication, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Senha atual incorreta.");
    }
}
