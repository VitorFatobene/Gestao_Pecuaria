package gestao.pecuaria.backend.animal.dto;

import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "Dados retornados para um animal cadastrado.")
public record AnimalResponseDTO(
        @Schema(description = "ID interno do animal.", example = "1")
        Long id,
        @Schema(description = "Código de identificação do animal na propriedade.", example = "1024")
        Long codigoAnimal,
        @Schema(description = "Raça predominante do animal.", example = "Nelore")
        String raca,
        @Schema(description = "Sexo do animal.", example = "MACHO")
        SexoAnimal sexo,
        @Schema(description = "Peso do animal em quilogramas.", example = "420.50")
        BigDecimal pesoKg,
        @Schema(description = "Peso convertido para arrobas.", example = "28.03")
        BigDecimal pesoArroba,
        @Schema(description = "Valor pago na compra do animal.", example = "3850.00")
        BigDecimal valorPago,
        @Schema(description = "Valor do frete pago na compra.", example = "150.00")
        BigDecimal valorFrete,
        @Schema(description = "Nome do vendedor do animal.", example = "Fazenda Santa Luzia")
        String nomeVendedor,
        @Schema(description = "Data da compra.", example = "2026-02-15")
        LocalDate dataCompra,
        @Schema(description = "URL de imagem do animal.", example = "https://cdn.fazenda.com.br/animais/1024.jpg")
        String imagemUrl,
        @Schema(description = "Status operacional do animal.", example = "ATIVO")
        StatusAnimal status,
        @Schema(description = "ID do pasto vinculado ao animal.", example = "1")
        Long pastoId,
        @Schema(description = "Nome do pasto vinculado ao animal.", example = "Pasto Maternidade")
        String nomePasto,
        @Schema(description = "Data e hora de criação do registro.", example = "2026-02-15T10:30:00")
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
