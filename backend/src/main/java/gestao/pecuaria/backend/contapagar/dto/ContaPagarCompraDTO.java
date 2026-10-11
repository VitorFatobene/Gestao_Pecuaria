package gestao.pecuaria.backend.contapagar.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ContaPagarCompraDTO(
        Long id,
        String fornecedor,
        LocalDate dataCompra,
        BigDecimal valorTotal,
        Integer quantidadeAnimais,
        List<ContaPagarCompraAnimalDTO> animais
) {
}
