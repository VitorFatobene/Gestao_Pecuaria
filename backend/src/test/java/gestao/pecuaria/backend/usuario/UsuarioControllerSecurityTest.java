package gestao.pecuaria.backend.usuario;

import gestao.pecuaria.backend.usuario.dto.PerfilUsuarioResponseDTO;
import gestao.pecuaria.backend.usuario.dto.UsuarioResponseDTO;
import gestao.pecuaria.backend.security.CustomUserDetailsService;
import gestao.pecuaria.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UsuarioController.class)
@Import(UsuarioControllerSecurityTest.TestSecurityConfig.class)
class UsuarioControllerSecurityTest {

    private static final String REQUEST_BODY = """
            {
              "nome": "Usuario",
              "sobrenome": "Teste",
              "telefone": "(11) 99999-9999",
              "cidade": "Ribeirao Preto",
              "estado": "SP",
              "email": "user@email.com",
              "senha": "123456",
              "nomePropriedadeRural": "Fazenda Boa Vista"
            }
            """;

    private static final String PERFIL_REQUEST_BODY = """
            {
              "nome": "Usuario",
              "nomeFazenda": "Fazenda Boa Vista",
              "senhaAtual": "123456",
              "novaSenha": "novaSenha",
              "confirmacaoNovaSenha": "novaSenha",
              "role": "ADMIN"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void deveRetornarUnauthorizedAoBuscarMeSemToken() throws Exception {
        mockMvc.perform(get("/usuarios/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@email.com", roles = "USER")
    void userDeveBuscarPropriosDados() throws Exception {
        when(usuarioService.buscarUsuarioAutenticado(any())).thenReturn(perfilResponse(1L, "user@email.com", Role.USER));

        mockMvc.perform(get("/usuarios/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.email").value("user@email.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @WithMockUser(username = "user@email.com", roles = "USER")
    void userNaoDeveListarUsuarios() throws Exception {
        mockMvc.perform(get("/usuarios")
                        .header("Authorization", "Bearer token-user"))
                .andExpect(status().isForbidden());

        verify(usuarioService, never()).listarTodos();
    }

    @Test
    @WithMockUser(username = "user@email.com", roles = "USER")
    void userNaoDeveConsultarOutroUsuarioPorId() throws Exception {
        mockMvc.perform(get("/usuarios/2")
                        .header("Authorization", "Bearer token-user"))
                .andExpect(status().isForbidden());

        verify(usuarioService, never()).buscarPorId(2L);
    }

    @Test
    @WithMockUser(username = "user@email.com", roles = "USER")
    void userNaoDeveAtualizarOutroUsuarioPorId() throws Exception {
        mockMvc.perform(put("/usuarios/2")
                        .header("Authorization", "Bearer token-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REQUEST_BODY))
                .andExpect(status().isForbidden());

        verify(usuarioService, never()).atualizar(eq(2L), any());
    }

    @Test
    @WithMockUser(username = "user@email.com", roles = "USER")
    void userDeveAtualizarPropriosDados() throws Exception {
        when(usuarioService.atualizarUsuarioAutenticado(any(), any())).thenReturn(perfilResponse(1L, "user@email.com", Role.USER));

        mockMvc.perform(put("/usuarios/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(PERFIL_REQUEST_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nomeFazenda").value("Fazenda Boa Vista"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @WithMockUser(username = "admin@email.com", roles = "ADMIN")
    void adminDeveListarUsuarios() throws Exception {
        when(usuarioService.listarTodos()).thenReturn(List.of(
                usuarioResponse(1L, "admin@email.com", Role.ADMIN),
                usuarioResponse(2L, "user@email.com", Role.USER)
        ));

        mockMvc.perform(get("/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].role").value("ADMIN"))
                .andExpect(jsonPath("$[1].role").value("USER"));
    }

    @Test
    @WithMockUser(username = "admin@email.com", roles = "ADMIN")
    void adminDeveConsultarUsuarioPorId() throws Exception {
        when(usuarioService.buscarPorId(2L)).thenReturn(usuarioResponse(2L, "user@email.com", Role.USER));

        mockMvc.perform(get("/usuarios/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2L));
    }

    @Test
    @WithMockUser(username = "admin@email.com", roles = "ADMIN")
    void adminDeveAtualizarUsuarioPorId() throws Exception {
        when(usuarioService.atualizar(eq(2L), any())).thenReturn(usuarioResponse(2L, "user@email.com", Role.USER));

        mockMvc.perform(put("/usuarios/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REQUEST_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2L));
    }

    @Test
    void cadastroPublicoNaoDeveCriarAdminPorPayload() throws Exception {
        String bodyComRoleAdmin = """
                {
                  "nome": "Usuario",
                  "sobrenome": "Teste",
                  "telefone": "(11) 99999-9999",
                  "cidade": "Ribeirao Preto",
                  "estado": "SP",
                  "email": "user@email.com",
                  "senha": "123456",
                  "nomePropriedadeRural": "Fazenda Boa Vista",
                  "role": "ADMIN"
                }
                """;
        when(usuarioService.criar(any())).thenReturn(usuarioResponse(3L, "user@email.com", Role.USER));

        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyComRoleAdmin))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("USER"));
    }

    private UsuarioResponseDTO usuarioResponse(Long id, String email, Role role) {
        return new UsuarioResponseDTO(
                id,
                "Usuario",
                "Teste",
                "(11) 99999-9999",
                "Ribeirao Preto",
                "SP",
                email,
                "Fazenda Boa Vista",
                role,
                LocalDateTime.of(2026, 8, 30, 12, 0)
        );
    }

    private PerfilUsuarioResponseDTO perfilResponse(Long id, String email, Role role) {
        return new PerfilUsuarioResponseDTO(
                id,
                "Usuario",
                email,
                "Fazenda Boa Vista",
                role
        );
    }

    @TestConfiguration
    @EnableMethodSecurity
    static class TestSecurityConfig {

        private static final AuthorizationManager<RequestAuthorizationContext> ADMIN_ACCESS = (authentication, context) ->
                new AuthorizationDecision(authentication.get().getAuthorities()
                        .stream()
                        .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority())));

        @Bean
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(csrf -> csrf.disable())
                    .httpBasic(AbstractHttpConfigurer::disable)
                    .formLogin(AbstractHttpConfigurer::disable)
                    .logout(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers(HttpMethod.POST, "/usuarios").permitAll()
                            .requestMatchers(HttpMethod.GET, "/usuarios/me").authenticated()
                            .requestMatchers(HttpMethod.PUT, "/usuarios/me").authenticated()
                            .requestMatchers(HttpMethod.GET, "/usuarios").access(ADMIN_ACCESS)
                            .requestMatchers(HttpMethod.GET, "/usuarios/{id}").access(ADMIN_ACCESS)
                            .requestMatchers(HttpMethod.PUT, "/usuarios/{id}").access(ADMIN_ACCESS)
                            .anyRequest().authenticated()
                    )
                    .exceptionHandling(exception -> exception
                            .authenticationEntryPoint((request, response, authException) -> {
                                String authorization = request.getHeader("Authorization");
                                if (authException instanceof InsufficientAuthenticationException
                                        && authException.getCause() instanceof AccessDeniedException
                                        && authorization != null
                                        && authorization.startsWith("Bearer ")) {
                                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
                                    return;
                                }

                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                            })
                            .accessDeniedHandler((request, response, accessDeniedException) ->
                                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden")
                            )
                    )
                    .build();
        }
    }
}
