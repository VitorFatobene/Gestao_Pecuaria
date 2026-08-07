package gestao.pecuaria.backend.cotacao.service;

import gestao.pecuaria.backend.cotacao.client.AgroDocClient;
import gestao.pecuaria.backend.cotacao.config.AgroDocProperties;
import gestao.pecuaria.backend.cotacao.dto.CotacaoBoiResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CotacaoServiceTest {

    private static final String CHAVE_COTACAO_BOI = "cotacao:boi:PR";
    private static final Duration TTL_COTACAO_BOI = Duration.ofHours(6);

    @Mock
    private RedisTemplate<String, CotacaoBoiResponseDTO> redisTemplate;

    @Mock
    private ValueOperations<String, CotacaoBoiResponseDTO> valueOperations;

    @Mock
    private AgroDocClient agroDocClient;

    private CotacaoService cotacaoService;

    @BeforeEach
    void setUp() {
        cotacaoService = new CotacaoService(
                redisTemplate,
                agroDocClient,
                new AgroDocProperties("https://agrodocai.com.br/api/v1", "PR")
        );
    }

    @Test
    void deveRetornarCotacaoDoRedisQuandoCacheExistir() {
        CotacaoBoiResponseDTO cotacaoCacheada = cotacao();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(CHAVE_COTACAO_BOI)).thenReturn(cotacaoCacheada);

        CotacaoBoiResponseDTO resposta = cotacaoService.obterCotacaoBoi();

        assertThat(resposta).isEqualTo(cotacaoCacheada);
        verify(agroDocClient, never()).buscarCotacaoBoi();
    }

    @Test
    void deveBuscarNaAgroDocESalvarNoRedisQuandoCacheNaoExistir() {
        CotacaoBoiResponseDTO cotacaoAtual = cotacao();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(CHAVE_COTACAO_BOI)).thenReturn(null);
        when(agroDocClient.buscarCotacaoBoi()).thenReturn(cotacaoAtual);

        CotacaoBoiResponseDTO resposta = cotacaoService.obterCotacaoBoi();

        assertThat(resposta).isEqualTo(cotacaoAtual);
        verify(agroDocClient).buscarCotacaoBoi();
        verify(valueOperations).set(CHAVE_COTACAO_BOI, cotacaoAtual, TTL_COTACAO_BOI);
    }

    private CotacaoBoiResponseDTO cotacao() {
        return new CotacaoBoiResponseDTO(
                new BigDecimal("355.00"),
                "PR",
                "PR",
                LocalDateTime.of(2026, 8, 6, 13, 5, 40)
        );
    }
}
