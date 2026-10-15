package gestao.pecuaria.backend.venda.dto;

import gestao.pecuaria.backend.animal.enums.SexoAnimal;

import java.math.BigDecimal;

public record AnimalVendaDetalheDTO(
        Long id,
        Long codigoAnimal,
        String raca,
        SexoAnimal sexo,
        BigDecimal pesoKg,
        BigDecimal valorAtribuido,
        BigDecimal valorPorArroba
) {
}
