package gestao.pecuaria.backend.usuario;

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
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.nome()).isEqualTo("Administrador");
        assertThat(response.sobrenome()).isEqualTo("Silva");
        assertThat(response.telefone()).isEqualTo("(11) 99999-9999");
        assertThat(response.cidade()).isEqualTo("Ribeirão Preto");
        assertThat(response.estado()).isEqualTo("SP");
        assertThat(response.email()).isEqualTo("admin@email.com");
        assertThat(response.nomePropriedadeRural()).isEqualTo("Fazenda Boa Vista");
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
}
