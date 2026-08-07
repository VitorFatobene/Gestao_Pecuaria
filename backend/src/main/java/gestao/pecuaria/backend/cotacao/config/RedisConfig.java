package gestao.pecuaria.backend.cotacao.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import gestao.pecuaria.backend.cotacao.dto.CotacaoBoiResponseDTO;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(AgroDocProperties.class)
public class RedisConfig {

    @Bean
    public RedisTemplate<String, CotacaoBoiResponseDTO> cotacaoBoiRedisTemplate(
            RedisConnectionFactory redisConnectionFactory
    ) {
        ObjectMapper redisObjectMapper = JsonMapper.builder()
                .findAndAddModules()
                .build()
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        Jackson2JsonRedisSerializer<CotacaoBoiResponseDTO> valueSerializer =
                new Jackson2JsonRedisSerializer<>(redisObjectMapper, CotacaoBoiResponseDTO.class);

        RedisTemplate<String, CotacaoBoiResponseDTO> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(valueSerializer);
        template.setHashValueSerializer(valueSerializer);
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public RestClient agroDocRestClient(AgroDocProperties properties) {
        return RestClient.create(properties.url());
    }
}
