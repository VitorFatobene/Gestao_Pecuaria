package gestao.pecuaria.backend.venda.dto;

import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "Dados retornados para uma venda registrada.")
public record VendaResponseDTO(
        @Schema(description = "ID interno da venda.", example = "1")
        Long id,
        @Schema(description = "ID do animal vendido.", example = "1")
        Long animalId,
        @Schema(description = "Código de identificação do animal vendido.", example = "1024")
        Long codigoAnimal,
        @Schema(description = "Nome do comprador.", example = "Frigorífico Boa Carne")
        String nomeComprador,
        @Schema(description = "Valor total da venda.", example = "5200.00")
        BigDecimal valorVenda,
        @Schema(description = "Data da venda.", example = "2026-03-20")
        LocalDate dataVenda,
        @Schema(description = "Peso do animal em quilogramas no momento da venda.", example = "465.80")
        BigDecimal pesoKgVenda,
        @Schema(description = "Peso do animal convertido para arrobas no momento da venda.", example = "31.05")
        BigDecimal pesoArrobaVenda,
        @Schema(description = "Raça predominante do animal vendido.", example = "Nelore")
        String racaAnimal,
        @Schema(description = "Sexo do animal vendido.", example = "MACHO")
        SexoAnimal sexoAnimal,
        @Schema(description = "Peso atual registrado no cadastro do animal.", example = "465.80")
        BigDecimal pesoKgAnimal,
        @Schema(description = "Valor pago na compra do animal.", example = "3850.00")
        BigDecimal valorCompraAnimal,
        @Schema(description = "Valor de frete pago na compra do animal.", example = "150.00")
        BigDecimal valorFreteAnimal,
        @Schema(description = "ID do pasto atual vinculado ao animal, quando existir.", example = "1")
        Long pastoIdAnimal,
        @Schema(description = "Nome do pasto atual vinculado ao animal, quando existir.", example = "Pasto Maternidade")
        String nomePastoAnimal,
        @Schema(description = "Status comercial da venda.", example = "CONCLUIDA")
        String status,
        @Schema(description = "Data e hora de criação do registro.", example = "2026-03-20T14:45:00")
        LocalDateTime criadoEm
) {
}
