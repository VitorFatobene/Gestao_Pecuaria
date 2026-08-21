package gestao.pecuaria.backend.config;

import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.AnimalService;
import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
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

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled || animalRepository.count() > 0) {
            return;
        }

        List<Pasto> pastos = criarPastos();
        criarAnimais(pastos);
    }

    private List<Pasto> criarPastos() {
        List<Pasto> pastos = new ArrayList<>();

        for (int index = 0; index < PASTO_NAMES.length; index++) {
            Pasto pasto = new Pasto();
            pasto.setNome(PASTO_NAMES[index]);
            pasto.setAreaHectares(BigDecimal.valueOf(20L + (index * 3L) % 31L).setScale(2, RoundingMode.HALF_UP));
            pasto.setDescricao(DESCRICAO_PASTO);
            pasto.setAtivo(true);
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
                    pasto.getId()
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
