package gestao.pecuaria.backend.cotacao.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "agrodoc.api")
public record AgroDocProperties(
        String url,
        String uf
) {
}
