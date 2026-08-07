package gestao.pecuaria.backend.cotacao.service;

import gestao.pecuaria.backend.cotacao.client.AgroDocClient;
import gestao.pecuaria.backend.cotacao.config.AgroDocProperties;
import gestao.pecuaria.backend.cotacao.dto.CotacaoBoiResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CotacaoService {

    private static final Duration TTL_COTACAO_BOI = Duration.ofHours(6);

    private final RedisTemplate<String, CotacaoBoiResponseDTO> cotacaoBoiRedisTemplate;
    private final AgroDocClient agroDocClient;
    private final AgroDocProperties properties;

    public CotacaoBoiResponseDTO obterCotacaoBoi() {
        String chave = chaveCotacaoBoi();
        CotacaoBoiResponseDTO cotacaoCacheada = cotacaoBoiRedisTemplate.opsForValue().get(chave);

        if (cotacaoCacheada != null) {
            return cotacaoCacheada;
        }

        CotacaoBoiResponseDTO cotacaoAtual = agroDocClient.buscarCotacaoBoi();
        cotacaoBoiRedisTemplate.opsForValue().set(chave, cotacaoAtual, TTL_COTACAO_BOI);
        return cotacaoAtual;
    }

    private String chaveCotacaoBoi() {
        return "cotacao:boi:" + properties.uf().toUpperCase(Locale.ROOT);
    }
}
