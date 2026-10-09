package gestao.pecuaria.backend.config;

import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.AnimalService;
import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.usuario.Role;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String[] PASTO_NAMES = {
            "Boa Vista 01",
            "Boa Vista 02",
            "Boa Vista 03",
            "Boa Vista 04",
            "Boa Vista 05",
            "Boa Vista 06",
            "Boa Vista 07",
            "Boa Vista 08",
            "Boa Vista 09",
            "Boa Vista 10"
    };
    private static final String[] RACAS = {"Nelore", "Angus", "Guzerá"};
    private static final String DESCRICAO_PASTO = "Pasto destinado ao manejo do rebanho.";
    private static final String NOME_VENDEDOR = "Fornecedor Rural";

    private final PastoRepository pastoRepository;
    private final AnimalRepository animalRepository;
    private final AnimalService animalService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled || animalRepository.count() > 0) {
            return;
        }

        Usuario usuario = obterOuCriarUsuarioSeed();
        Authentication autenticacaoAnterior = SecurityContextHolder.getContext().getAuthentication();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                usuario.getEmail(),
                null,
                List.of()
        ));

        try {
            List<Pasto> pastos = criarPastos(usuario);
            criarAnimais(pastos);
        } finally {
            SecurityContextHolder.getContext().setAuthentication(autenticacaoAnterior);
        }
    }

    private Usuario obterOuCriarUsuarioSeed() {
        return usuarioRepository.findByEmail("dev@gestaopecuaria.local")
                .orElseGet(() -> {
                    Usuario usuario = new Usuario();
                    usuario.setNome("Usuario");
                    usuario.setSobrenome("Desenvolvimento");
                    usuario.setTelefone("00000000000");
                    usuario.setCidade("Curitiba");
                    usuario.setEstado("PR");
                    usuario.setEmail("dev@gestaopecuaria.local");
                    usuario.setSenha(passwordEncoder.encode("dev123456"));
                    usuario.setNomePropriedadeRural("Fazenda Desenvolvimento");
                    usuario.setRole(Role.USER);
                    return usuarioRepository.save(usuario);
                });
    }

    private List<Pasto> criarPastos(Usuario usuario) {
        List<Pasto> pastos = new ArrayList<>();

        for (int index = 0; index < PASTO_NAMES.length; index++) {
            Pasto pasto = new Pasto();
            pasto.setNome(PASTO_NAMES[index]);
            pasto.setAreaHectares(BigDecimal.valueOf(20L + (index * 3L) % 31L).setScale(2, RoundingMode.HALF_UP));
            pasto.setDescricao(DESCRICAO_PASTO);
            pasto.setAtivo(true);
            pasto.setUsuario(usuario);
            pastos.add(pasto);
        }

        return pastoRepository.saveAll(pastos);
    }

    private void criarAnimais(List<Pasto> pastos) {
        for (int index = 1; index <= 50; index++) {
            Pasto pasto = pastos.get((index - 1) / 5);
            animalService.criar(new AnimalRequestDTO(
                    (long) index,
                    RACAS[(index - 1) % RACAS.length],
                    index % 2 == 0 ? SexoAnimal.FEMEA : SexoAnimal.MACHO,
                    calcularPesoKg(index),
                    calcularValorPago(index),
                    calcularValorFrete(index),
                    NOME_VENDEDOR,
                    LocalDate.now().minusDays((index * 7L) % 365L),
                    null,
                    pasto.getId(),
                    null,
                    null,
                    null,
                    null,
                    null
            ));
        }
    }

    private BigDecimal calcularPesoKg(int index) {
        return BigDecimal.valueOf(350L + (index * 17L) % 251L).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calcularValorPago(int index) {
        return BigDecimal.valueOf(3000L + (index * 137L) % 3001L).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calcularValorFrete(int index) {
        return BigDecimal.valueOf(150L + (index * 23L) % 351L).setScale(2, RoundingMode.HALF_UP);
    }
}
