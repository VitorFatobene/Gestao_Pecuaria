package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.TestSecurityUtils;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.security.JwtService;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.lessThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AnimalControllerSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private PastoRepository pastoRepository;

    @Test
    void usuarioAutenticadoSemAnimaisDeveListarPaginaVazia() throws Exception {
        Usuario usuario = salvarUsuario("animais-vazio-" + System.nanoTime() + "@teste.com");

        mockMvc.perform(get("/animais")
                        .param("page", "0")
                        .param("size", "20")
                        .header("Authorization", bearer(usuario)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(0))
                .andExpect(jsonPath("$.totalPages").value(0))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void usuarioUserDeveListarPrimeiraPaginaComNoMaximoVinteAnimais() throws Exception {
        Usuario usuario = salvarUsuario("animais-user-" + System.nanoTime() + "@teste.com");
        Pasto pasto = salvarPasto(usuario, "Pasto User");
        salvarAnimais(usuario, pasto, 21, 10_000L, "Nelore", StatusAnimal.ATIVO);

        mockMvc.perform(get("/animais")
                        .param("page", "0")
                        .param("size", "20")
                        .header("Authorization", bearer(usuario)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(20)))
                .andExpect(jsonPath("$.content.length()").value(lessThanOrEqualTo(20)))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(21))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(false));
    }

    @Test
    void usuarioUserComMenosDeVinteAnimaisDeveListarTodos() throws Exception {
        Usuario usuario = salvarUsuario("animais-menos-vinte-" + System.nanoTime() + "@teste.com");
        Pasto pasto = salvarPasto(usuario, "Pasto Menos Vinte");
        salvarAnimais(usuario, pasto, 7, 15_000L, "Nelore", StatusAnimal.ATIVO);

        mockMvc.perform(get("/animais")
                        .param("page", "0")
                        .param("size", "20")
                        .header("Authorization", bearer(usuario)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(7)))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(7))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void usuarioUserDeveListarSegundaPagina() throws Exception {
        Usuario usuario = salvarUsuario("animais-pagina-2-" + System.nanoTime() + "@teste.com");
        Pasto pasto = salvarPasto(usuario, "Pasto Pagina 2");
        salvarAnimais(usuario, pasto, 21, 20_000L, "Nelore", StatusAnimal.ATIVO);

        mockMvc.perform(get("/animais")
                        .param("page", "1")
                        .param("size", "20")
                        .header("Authorization", bearer(usuario)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(21))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.first").value(false))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    void paginacaoDeveRespeitarIsolamentoMultiusuario() throws Exception {
        Usuario usuarioA = salvarUsuario("animais-a-" + System.nanoTime() + "@teste.com");
        Usuario usuarioB = salvarUsuario("animais-b-" + System.nanoTime() + "@teste.com");
        salvarAnimais(usuarioA, salvarPasto(usuarioA, "Pasto A"), 25, 30_000L, "Nelore", StatusAnimal.ATIVO);
        salvarAnimais(usuarioB, salvarPasto(usuarioB, "Pasto B"), 10, 40_000L, "Angus", StatusAnimal.ATIVO);

        mockMvc.perform(get("/animais")
                        .param("page", "0")
                        .param("size", "20")
                        .header("Authorization", bearer(usuarioA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(20)))
                .andExpect(jsonPath("$.content[*].raca", everyItem(org.hamcrest.Matchers.equalTo("Nelore"))))
                .andExpect(jsonPath("$.totalElements").value(25))
                .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    void paginacaoDeveFuncionarComFiltros() throws Exception {
        Usuario usuario = salvarUsuario("animais-filtro-" + System.nanoTime() + "@teste.com");
        Pasto pastoA = salvarPasto(usuario, "Pasto Filtro A");
        Pasto pastoB = salvarPasto(usuario, "Pasto Filtro B");
        salvarAnimais(usuario, pastoA, 25, 50_000L, "Nelore", StatusAnimal.ATIVO);
        salvarAnimais(usuario, pastoB, 8, 60_000L, "Angus", StatusAnimal.ATIVO);

        mockMvc.perform(get("/animais")
                        .param("page", "0")
                        .param("size", "20")
                        .param("busca", "nel")
                        .param("pastoId", String.valueOf(pastoA.getId()))
                        .param("status", "ATIVO")
                        .param("raca", "Nelore")
                        .header("Authorization", bearer(usuario)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(20)))
                .andExpect(jsonPath("$.content[*].raca", everyItem(org.hamcrest.Matchers.equalTo("Nelore"))))
                .andExpect(jsonPath("$.totalElements").value(25))
                .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    void usuarioNaoAutenticadoContinuaBloqueado() throws Exception {
        mockMvc.perform(get("/animais")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isUnauthorized());
    }

    private Usuario salvarUsuario(String email) {
        return usuarioRepository.save(TestSecurityUtils.usuario(email));
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwtService.gerarToken(usuario);
    }

    private Pasto salvarPasto(Usuario usuario, String nome) {
        Pasto pasto = new Pasto();
        pasto.setNome(nome + " " + System.nanoTime());
        pasto.setAreaHectares(new BigDecimal("12.50"));
        pasto.setAtivo(true);
        pasto.setUsuario(usuario);
        return pastoRepository.save(pasto);
    }

    private void salvarAnimais(
            Usuario usuario,
            Pasto pasto,
            int quantidade,
            long codigoInicial,
            String raca,
            StatusAnimal status
    ) {
        for (int index = 0; index < quantidade; index++) {
            Animal animal = new Animal();
            animal.setCodigoAnimal(codigoInicial + index);
            animal.setRaca(raca);
            animal.setSexo(SexoAnimal.MACHO);
            animal.setPesoKg(new BigDecimal("420.00"));
            animal.setValorPago(new BigDecimal("9000.00"));
            animal.setValorFrete(BigDecimal.ZERO);
            animal.setNomeVendedor("Fazenda Santa Luzia");
            animal.setDataCompra(LocalDate.of(2026, 10, 6));
            animal.setStatus(status);
            animal.setUsuario(usuario);
            animal.setPasto(pasto);
            animalRepository.save(animal);
        }
    }
}
