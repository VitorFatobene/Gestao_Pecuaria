package gestao.pecuaria.backend.venda;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import gestao.pecuaria.backend.lote.enums.StatusLote;
import gestao.pecuaria.backend.pagamento.dto.PagamentoResumoDTO;
import gestao.pecuaria.backend.pagamento.dto.PagamentoVendaResponseDTO;
import gestao.pecuaria.backend.venda.dto.VendaResponseDTO;
import gestao.pecuaria.backend.venda.enums.StatusVenda;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class VendaControllerTest {

    private VendaService vendaService;
    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        vendaService = mock(VendaService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new VendaController(vendaService)).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    void deveCriarVendaCompletaDeLotePeloEndpoint() throws Exception {
        VendaResponseDTO response = new VendaResponseDTO(
                1L,
                10L,
                "Lote Nelore",
                StatusLote.VENDIDO,
                2L,
                new BigDecimal("550.50"),
                "Frigorífico Boa Carne",
                new BigDecimal("100000.00"),
                LocalDate.of(2026, 8, 11),
                new BigDecimal("550.50"),
                new BigDecimal("18.35"),
                StatusVenda.AGUARDANDO_PAGAMENTO,
                new PagamentoResumoDTO("PARCELADO", 1, 1),
                List.of(new PagamentoVendaResponseDTO(
                        1L,
                        1,
                        new BigDecimal("20000.00"),
                        LocalDate.of(2026, 8, 11),
                        LocalDate.of(2026, 8, 11),
                        gestao.pecuaria.backend.pagamento.enums.StatusPagamento.PAGO,
                        null
                )),
                null
        );

        when(vendaService.realizarVendaLote(any())).thenReturn(response);

        String body = """
                {
                  "loteId": 10,
                  "comprador": "Frigorífico Boa Carne",
                  "valorTotal": 100000.00,
                  "dataVenda": "2026-08-11",
                  "condicaoPagamento": {
                    "tipoPagamento": "PARCELADO",
                    "entrada": 20000.00,
                    "quantidadeParcelas": 4,
                    "intervaloDias": 30,
                    "diasCarencia": 30
                  }
                }
                """;

        mockMvc.perform(post("/vendas/lote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.loteId").value(10L))
                .andExpect(jsonPath("$.statusLote").value("VENDIDO"))
                .andExpect(jsonPath("$.pagamento.tipoPagamento").value("PARCELADO"))
                .andExpect(jsonPath("$.pagamento.parcelaAtual").value(1))
                .andExpect(jsonPath("$.pagamento.totalParcelas").value(1))
                .andExpect(jsonPath("$.pagamentos[0].valor").value(20000.00));
    }
}
