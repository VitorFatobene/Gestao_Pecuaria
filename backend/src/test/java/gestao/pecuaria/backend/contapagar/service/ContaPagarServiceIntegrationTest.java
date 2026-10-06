package gestao.pecuaria.backend.contapagar.service;

import gestao.pecuaria.backend.contapagar.dto.ContaPagarResponseDTO;
import gestao.pecuaria.backend.contapagar.dto.CriarContaPagarRequestDTO;
import gestao.pecuaria.backend.contapagar.dto.RegistrarPagamentoParcelaRequestDTO;
import gestao.pecuaria.backend.contapagar.enums.CategoriaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;
import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class ContaPagarServiceIntegrationTest {

    @Autowired
    private ContaPagarService contaPagarService;

    @Test
    void deveRetornarIdETimestampNaCriacaoPersistida() {
        ContaPagarResponseDTO resposta = contaPagarService.criar(criarRequest());

        assertThat(resposta.id()).isNotNull();
        assertThat(resposta.criadoEm()).isNotNull();
        assertThat(resposta.parcelas()).singleElement().satisfies(parcela ->
                assertThat(parcela.id()).isNotNull()
        );
    }

    @Test
    void deveRegistrarPagamentoComBloqueioDaContaPersistida() {
        ContaPagarResponseDTO criada = contaPagarService.criar(criarRequest());
        Long parcelaId = criada.parcelas().getFirst().id();

        ContaPagarResponseDTO paga = contaPagarService.registrarPagamento(
                parcelaId,
                new RegistrarPagamentoParcelaRequestDTO(LocalDate.of(2026, 10, 6), FormaPagamento.PIX)
        );

        assertThat(paga.status()).isEqualTo(StatusContaPagar.PAGA);
        assertThat(paga.parcelas()).singleElement().satisfies(parcela ->
                assertThat(parcela.status()).isEqualTo(StatusParcelaContaPagar.PAGA)
        );
    }

    private CriarContaPagarRequestDTO criarRequest() {
        return new CriarContaPagarRequestDTO(
                "Compra de ração",
                CategoriaContaPagar.RACAO,
                "Fornecedor integração",
                new BigDecimal("250.00"),
                LocalDate.of(2026, 10, 6),
                TipoPagamentoContaPagar.A_VISTA,
                null,
                null,
                null,
                null,
                null
        );
    }
}
