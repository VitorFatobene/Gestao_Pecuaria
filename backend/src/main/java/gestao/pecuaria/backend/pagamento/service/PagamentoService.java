package gestao.pecuaria.backend.pagamento.service;

import gestao.pecuaria.backend.pagamento.dto.CondicaoPagamentoDTO;
import gestao.pecuaria.backend.pagamento.entity.PagamentoVenda;
import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import gestao.pecuaria.backend.pagamento.enums.StatusPagamento;
import gestao.pecuaria.backend.pagamento.repository.PagamentoVendaRepository;
import gestao.pecuaria.backend.venda.Venda;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PagamentoService {

    private static final int ESCALA_MONETARIA = 2;

    private final PagamentoVendaRepository pagamentoVendaRepository;

    @Transactional
    public List<PagamentoVenda> gerarPagamentoVista(Venda venda, FormaPagamento formaPagamento) {
        validarVenda(venda);

        PagamentoVenda pagamento = criarPagamento(
                venda,
                1,
                venda.getValorTotal(),
                venda.getDataVenda(),
                venda.getDataVenda(),
                StatusPagamento.PAGO,
                formaPagamento
        );

        return pagamentoVendaRepository.saveAll(List.of(pagamento));
    }

    @Transactional
    public List<PagamentoVenda> gerarPagamentoPrazo(Venda venda, CondicaoPagamentoDTO condicaoPagamento, FormaPagamento formaPagamento) {
        validarVenda(venda);
        validarCondicao(condicaoPagamento);
        int diasCarencia = obterInteiroPositivo(condicaoPagamento.diasCarencia(), "dias de carência");

        PagamentoVenda pagamento = criarPagamento(
                venda,
                1,
                venda.getValorTotal(),
                venda.getDataVenda().plusDays(diasCarencia),
                null,
                StatusPagamento.PENDENTE,
                formaPagamento
        );

        return pagamentoVendaRepository.saveAll(List.of(pagamento));
    }

    @Transactional
    public List<PagamentoVenda> gerarPagamentoParcelado(Venda venda, CondicaoPagamentoDTO condicaoPagamento, FormaPagamento formaPagamento) {
        validarVenda(venda);
        validarCondicao(condicaoPagamento);
        int quantidadeParcelas = obterInteiroPositivo(condicaoPagamento.quantidadeParcelas(), "quantidade de parcelas");
        int intervaloDias = obterInteiroPositivo(condicaoPagamento.intervaloDias(), "intervalo em dias");
        int diasCarencia = condicaoPagamento.diasCarencia() != null ? condicaoPagamento.diasCarencia() : 0;

        if (diasCarencia < 0) {
            throw new IllegalArgumentException("Os dias de carência não podem ser negativos.");
        }

        BigDecimal entrada = valorOuZero(condicaoPagamento.entrada()).setScale(ESCALA_MONETARIA, RoundingMode.HALF_UP);
        if (entrada.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("A entrada não pode ser negativa.");
        }

        BigDecimal valorTotal = venda.getValorTotal().setScale(ESCALA_MONETARIA, RoundingMode.HALF_UP);
        if (entrada.compareTo(valorTotal) > 0) {
            throw new IllegalArgumentException("A entrada não pode ser maior que o valor total da venda.");
        }

        List<PagamentoVenda> pagamentos = new ArrayList<>();
        int numeroParcela = 1;

        if (entrada.compareTo(BigDecimal.ZERO) > 0) {
            pagamentos.add(criarPagamento(
                    venda,
                    numeroParcela++,
                    entrada,
                    venda.getDataVenda(),
                    venda.getDataVenda(),
                    StatusPagamento.PAGO,
                    formaPagamento
            ));
        }

        BigDecimal valorRestante = valorTotal.subtract(entrada);
        List<BigDecimal> parcelas = distribuirValor(valorRestante, quantidadeParcelas);
        LocalDate primeiroVencimento = venda.getDataVenda().plusDays(diasCarencia > 0 ? diasCarencia : intervaloDias);

        for (int i = 0; i < parcelas.size(); i++) {
            pagamentos.add(criarPagamento(
                    venda,
                    numeroParcela++,
                    parcelas.get(i),
                    primeiroVencimento.plusDays((long) i * intervaloDias),
                    null,
                    StatusPagamento.PENDENTE,
                    formaPagamento
            ));
        }

        return pagamentoVendaRepository.saveAll(pagamentos);
    }

    private PagamentoVenda criarPagamento(
            Venda venda,
            int numeroParcela,
            BigDecimal valor,
            LocalDate dataVencimento,
            LocalDate dataPagamento,
            StatusPagamento status,
            FormaPagamento formaPagamento
    ) {
        PagamentoVenda pagamento = new PagamentoVenda();
        pagamento.setVenda(venda);
        pagamento.setNumeroParcela(numeroParcela);
        pagamento.setValor(valor.setScale(ESCALA_MONETARIA, RoundingMode.HALF_UP));
        pagamento.setDataVencimento(dataVencimento);
        pagamento.setDataPagamento(dataPagamento);
        pagamento.setStatus(status);
        pagamento.setFormaPagamento(formaPagamento);
        return pagamento;
    }

    private List<BigDecimal> distribuirValor(BigDecimal valorTotal, int quantidadeParcelas) {
        BigDecimal valorBase = valorTotal.divide(BigDecimal.valueOf(quantidadeParcelas), ESCALA_MONETARIA, RoundingMode.DOWN);
        BigDecimal centavo = BigDecimal.valueOf(0.01);
        int centavosRestantes = valorTotal.subtract(valorBase.multiply(BigDecimal.valueOf(quantidadeParcelas)))
                .movePointRight(ESCALA_MONETARIA)
                .intValue();

        List<BigDecimal> parcelas = new ArrayList<>();
        for (int i = 0; i < quantidadeParcelas; i++) {
            BigDecimal ajuste = i < centavosRestantes ? centavo : BigDecimal.ZERO;
            parcelas.add(valorBase.add(ajuste).setScale(ESCALA_MONETARIA, RoundingMode.HALF_UP));
        }

        return parcelas;
    }

    private void validarVenda(Venda venda) {
        if (venda == null) {
            throw new IllegalArgumentException("A venda é obrigatória.");
        }

        if (venda.getValorTotal() == null || venda.getValorTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor total da venda deve ser maior que zero.");
        }

        if (venda.getDataVenda() == null) {
            throw new IllegalArgumentException("A data da venda é obrigatória.");
        }
    }

    private void validarCondicao(CondicaoPagamentoDTO condicaoPagamento) {
        if (condicaoPagamento == null) {
            throw new IllegalArgumentException("A condição de pagamento é obrigatória.");
        }
    }

    private int obterInteiroPositivo(Integer valor, String campo) {
        if (valor == null || valor <= 0) {
            throw new IllegalArgumentException("O campo " + campo + " deve ser maior que zero.");
        }

        return valor;
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }
}
