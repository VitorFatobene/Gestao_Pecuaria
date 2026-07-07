package gestao.pecuaria.backend.animal.dto;

import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AnimalResponseDTO(
        Long id,
        Long codigoAnimal,
        String raca,
        SexoAnimal sexo,
        BigDecimal pesoKg,
        BigDecimal pesoArroba,
        BigDecimal valorPago,
        BigDecimal valorFrete,
        String nomeVendedor,
        LocalDate dataCompra,
        String imagemUrl,
        StatusAnimal status,
        Long pastoId,
        String nomePasto,
        LocalDateTime criadoEm
) {
    public AnimalResponseDTO(
            Long id,
            Long codigoAnimal,
            String raca,
            BigDecimal pesoKg,
            BigDecimal valorPago,
            BigDecimal valorFrete,
            String nomeVendedor,
            LocalDate dataCompra,
            String imagemUrl
    ) {
        this(
                id,
                codigoAnimal,
                raca,
                null,
                pesoKg,
                null,
                valorPago,
                valorFrete,
                nomeVendedor,
                dataCompra,
                imagemUrl,
                null,
                null,
                null,
                null
        );
    }
}
