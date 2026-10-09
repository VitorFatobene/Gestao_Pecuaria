package gestao.pecuaria.backend.financeiro;

import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar;
import gestao.pecuaria.backend.contapagar.repository.ParcelaContaPagarRepository;
import gestao.pecuaria.backend.financeiro.dto.FinanceiroResumoDTO;
import gestao.pecuaria.backend.pagamento.enums.StatusPagamento;
import gestao.pecuaria.backend.pagamento.repository.PagamentoVendaRepository;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.usuario.UsuarioAutenticadoService;
import gestao.pecuaria.backend.venda.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class FinanceiroService {

    private final AnimalRepository animalRepository;
    private final PastoRepository pastoRepository;
    private final VendaRepository vendaRepository;
    private final PagamentoVendaRepository pagamentoVendaRepository;
    private final ParcelaContaPagarRepository parcelaContaPagarRepository;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    @Transactional(readOnly = true)
    public FinanceiroResumoDTO gerarResumo() {
        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();
        BigDecimal totalGasto = formatarValor(animalRepository.somarTotalGastoPorUsuario(usuarioId));
        BigDecimal ganhoTotal = formatarValor(vendaRepository.somarGanhoTotalPorUsuario(usuarioId));
        BigDecimal lucroTotal = formatarValor(ganhoTotal.subtract(totalGasto));
        BigDecimal receitasRealizadas = formatarValor(pagamentoVendaRepository.somarPorStatusAndUsuarioId(StatusPagamento.PAGO, usuarioId));
        BigDecimal receitasAReceber = formatarValor(pagamentoVendaRepository.somarAReceberPorUsuario(usuarioId));
        BigDecimal despesasRealizadas = formatarValor(parcelaContaPagarRepository.somarPorStatusAndUsuarioId(StatusParcelaContaPagar.PAGA, usuarioId));
        BigDecimal despesasAPagar = formatarValor(parcelaContaPagarRepository.somarAPagarPorUsuario(usuarioId));
        BigDecimal despesasVencidas = formatarValor(parcelaContaPagarRepository.somarVencidasPorUsuario(LocalDate.now(), usuarioId));
        BigDecimal saldoRealizado = formatarValor(receitasRealizadas.subtract(despesasRealizadas));
        BigDecimal saldoProjetado = formatarValor(receitasRealizadas.add(receitasAReceber)
                .subtract(despesasRealizadas.add(despesasAPagar)));

        return new FinanceiroResumoDTO(
                totalGasto,
                ganhoTotal,
                lucroTotal,
                receitasRealizadas,
                receitasAReceber,
                despesasRealizadas,
                despesasAPagar,
                despesasVencidas,
                saldoRealizado,
                saldoProjetado,
                toInteger(animalRepository.countByUsuarioId(usuarioId)),
                toInteger(animalRepository.countByStatusAndUsuarioId(StatusAnimal.ATIVO, usuarioId)),
                toInteger(animalRepository.countByStatusAndUsuarioId(StatusAnimal.VENDIDO, usuarioId)),
                toInteger(animalRepository.countByStatusAndUsuarioId(StatusAnimal.INATIVO, usuarioId)),
                toInteger(pastoRepository.countByUsuarioId(usuarioId)),
                toInteger(vendaRepository.countByUsuarioId(usuarioId))
        );
    }

    private BigDecimal formatarValor(BigDecimal valor) {
        return (valor != null ? valor : BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private Integer toInteger(long valor) {
        return Math.toIntExact(valor);
    }
}
