package gestao.pecuaria.backend.cotacao.client;

import gestao.pecuaria.backend.cotacao.config.AgroDocProperties;
import gestao.pecuaria.backend.cotacao.dto.CotacaoBoiResponseDTO;
import gestao.pecuaria.backend.cotacao.exception.CotacaoIndisponivelException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class AgroDocClient {

    private final RestClient agroDocRestClient;
    private final AgroDocProperties properties;

    public CotacaoBoiResponseDTO buscarCotacaoBoi() {
        try {
            AgroDocCotacaoResponse response = agroDocRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/cotacao")
                            .queryParam("uf", ufConfigurada())
                            .build())
                    .retrieve()
                    .body(AgroDocCotacaoResponse.class);

            return toDto(response);
        } catch (RestClientException exception) {
            throw new CotacaoIndisponivelException("Não foi possível consultar a cotação na AgroDocAPI.", exception);
        }
    }

    private CotacaoBoiResponseDTO toDto(AgroDocCotacaoResponse response) {
        if (response == null || response.boiGordoUf() == null || response.boiGordoUf().preco() == null) {
            throw new CotacaoIndisponivelException("Resposta inválida da AgroDocAPI.");
        }

        AgroDocBoiGordoUf boiGordoUf = response.boiGordoUf();
        return new CotacaoBoiResponseDTO(
                boiGordoUf.preco(),
                boiGordoUf.uf(),
                boiGordoUf.praca(),
                parseAtualizado(response.atualizado())
        );
    }

    private LocalDateTime parseAtualizado(String atualizado) {
        if (atualizado == null || atualizado.isBlank()) {
            throw new CotacaoIndisponivelException("Data de atualização inválida na resposta da AgroDocAPI.");
        }

        try {
            return OffsetDateTime.parse(atualizado).toLocalDateTime();
        } catch (RuntimeException exception) {
            throw new CotacaoIndisponivelException("Data de atualização inválida na resposta da AgroDocAPI.", exception);
        }
    }

    private String ufConfigurada() {
        return properties.uf().toUpperCase(Locale.ROOT);
    }

    private record AgroDocCotacaoResponse(
            String atualizado,
            @com.fasterxml.jackson.annotation.JsonProperty("boi_gordo_uf")
            AgroDocBoiGordoUf boiGordoUf
    ) {
    }

    private record AgroDocBoiGordoUf(
            String uf,
            BigDecimal preco,
            String praca
    ) {
    }
}
