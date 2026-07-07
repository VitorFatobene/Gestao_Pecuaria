package gestao.pecuaria.backend.venda.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record VendaResponseDTO(
        Long id,
        Long animalId,
        Long codigoAnimal,
        String nomeComprador,
        BigDecimal valorVenda,
        LocalDate dataVenda,
        BigDecimal pesoKgVenda,
        BigDecimal pesoArrobaVenda,
        LocalDateTime criadoEm
) {
}
