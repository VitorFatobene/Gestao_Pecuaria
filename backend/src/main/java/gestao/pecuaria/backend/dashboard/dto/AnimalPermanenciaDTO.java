package gestao.pecuaria.backend.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Animal com maior tempo de permanencia no pasto atual.")
public record AnimalPermanenciaDTO(
        @Schema(description = "Codigo de identificacao do animal.", example = "1023")
        String codigoAnimal,
        @Schema(description = "Nome do animal. Retorna nao cadastrado enquanto o modelo nao possui esse campo.", example = "Imperador")
        String nomeAnimal,
        @Schema(description = "Nome do pasto atual.", example = "Pasto Boa Vista 01")
        String pasto,
        @Schema(description = "Quantidade de dias no pasto atual.", example = "32")
        Integer diasNoPasto
) {
}
