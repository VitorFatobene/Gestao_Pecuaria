package gestao.pecuaria.backend.financeiro;

import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.financeiro.dto.FinanceiroResumoDTO;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.venda.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class FinanceiroService {

    private final AnimalRepository animalRepository;
    private final PastoRepository pastoRepository;
    private final VendaRepository vendaRepository;

    @Transactional(readOnly = true)
    public FinanceiroResumoDTO gerarResumo() {
        BigDecimal totalGasto = formatarValor(animalRepository.somarTotalGasto());
        BigDecimal ganhoTotal = formatarValor(vendaRepository.somarGanhoTotal());
        BigDecimal lucroTotal = formatarValor(ganhoTotal.subtract(totalGasto));

        return new FinanceiroResumoDTO(
                totalGasto,
                ganhoTotal,
                lucroTotal,
                toInteger(animalRepository.count()),
                toInteger(animalRepository.countByStatus(StatusAnimal.ATIVO)),
                toInteger(animalRepository.countByStatus(StatusAnimal.VENDIDO)),
                toInteger(animalRepository.countByStatus(StatusAnimal.INATIVO)),
                toInteger(pastoRepository.count()),
                toInteger(vendaRepository.count())
        );
    }

    private BigDecimal formatarValor(BigDecimal valor) {
        return (valor != null ? valor : BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private Integer toInteger(long valor) {
        return Math.toIntExact(valor);
    }
}
