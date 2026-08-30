package gestao.pecuaria.backend.usuario;

import gestao.pecuaria.backend.security.JwtService;
import gestao.pecuaria.backend.usuario.dto.LoginRequestDTO;
import gestao.pecuaria.backend.usuario.dto.LoginResponseDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void deveRetornarTokenAoRealizarLoginComCredenciaisValidas() {
        LoginRequestDTO request = new LoginRequestDTO("admin@email.com", "123456");
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("Administrador");
        usuario.setEmail("admin@email.com");
        usuario.setSenha("$2a$hash");
        usuario.setRole(Role.ADMIN);

        when(usuarioRepository.findByEmail(request.email())).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(request.senha(), usuario.getSenha())).thenReturn(true);
        when(jwtService.gerarToken(usuario)).thenReturn("jwt-token");

        LoginResponseDTO response = authService.login(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.tipo()).isEqualTo("Bearer");
        assertThat(response.usuarioId()).isEqualTo(1L);
        assertThat(response.nome()).isEqualTo("Administrador");
        assertThat(response.email()).isEqualTo("admin@email.com");
        assertThat(response.role()).isEqualTo(Role.ADMIN);
    }

    @Test
    void deveFalharAoRealizarLoginComEmailInexistente() {
        LoginRequestDTO request = new LoginRequestDTO("admin@email.com", "123456");

        when(usuarioRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("E-mail ou senha inválidos.");
    }

    @Test
    void deveFalharAoRealizarLoginComSenhaIncorreta() {
        LoginRequestDTO request = new LoginRequestDTO("admin@email.com", "123456");
        Usuario usuario = new Usuario();
        usuario.setEmail("admin@email.com");
        usuario.setSenha("$2a$hash");

        when(usuarioRepository.findByEmail(request.email())).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(request.senha(), usuario.getSenha())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("E-mail ou senha inválidos.");
    }
}
