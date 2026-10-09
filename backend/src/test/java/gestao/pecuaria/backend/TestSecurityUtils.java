package gestao.pecuaria.backend;

import gestao.pecuaria.backend.usuario.Role;
import gestao.pecuaria.backend.usuario.Usuario;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

public final class TestSecurityUtils {

    private TestSecurityUtils() {
    }

    public static Usuario usuario(String email) {
        Usuario usuario = new Usuario();
        usuario.setNome("Usuario");
        usuario.setSobrenome("Teste");
        usuario.setTelefone("41999999999");
        usuario.setCidade("Curitiba");
        usuario.setEstado("PR");
        usuario.setEmail(email);
        usuario.setSenha("senha");
        usuario.setNomePropriedadeRural("Fazenda Teste");
        usuario.setRole(Role.USER);
        return usuario;
    }

    public static void autenticar(Usuario usuario) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                usuario.getEmail(),
                null,
                List.of()
        ));
    }

    public static void limparAutenticacao() {
        SecurityContextHolder.clearContext();
    }
}
