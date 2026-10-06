package gestao.pecuaria.backend.contapagar.service;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.contapagar.dto.ContaPagarResponseDTO;
import gestao.pecuaria.backend.contapagar.dto.ContaPagarResumoDTO;
import gestao.pecuaria.backend.contapagar.dto.CriarContaPagarRequestDTO;
import gestao.pecuaria.backend.contapagar.dto.ParcelaContaPagarResponseDTO;
import gestao.pecuaria.backend.contapagar.dto.RegistrarPagamentoParcelaRequestDTO;
import gestao.pecuaria.backend.contapagar.entity.ContaPagar;
import gestao.pecuaria.backend.contapagar.entity.ParcelaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.CategoriaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.OrigemContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;
import gestao.pecuaria.backend.contapagar.repository.ContaPagarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ContaPagarService {

    private static final int ESCALA_MONETARIA = 2;
    private static final int MAXIMO_PARCELAS = 360;
    private static final int MAXIMO_INTERVALO_DIAS = 3650;

    private final ContaPagarRepository contaPagarRepository;

    @Transactional
    public ContaPagarResponseDTO criar(CriarContaPagarRequestDTO request) {
        return criarConta(request, OrigemContaPagar.MANUAL, null);
    }

    @Transactional
    public ContaPagarResponseDTO criarParaCompraAnimal(Animal animal, CriarContaPagarRequestDTO request) {
        if (animal == null || animal.getId() == null) {
            throw new IllegalArgumentException("Animal persistido é obrigatório para criar conta de compra.");
        }

        return contaPagarRepository.findByAnimalIdAndOrigem(animal.getId(), OrigemContaPagar.COMPRA_ANIMAL)
                .map(this::toResponseDTO)
                .orElseGet(() -> criarConta(request, OrigemContaPagar.COMPRA_ANIMAL, animal));
    }

    private ContaPagarResponseDTO criarConta(
            CriarContaPagarRequestDTO request,
            OrigemContaPagar origem,
            Animal animal
    ) {
        ContaPagar conta = new ContaPagar();
        conta.setDescricao(request.descricao().trim());
        conta.setCategoria(request.categoria());
        conta.setFornecedor(request.fornecedor().trim());
        conta.setValorTotal(monetario(request.valorTotal()));
        conta.setDataCompra(request.dataCompra());
        conta.setTipoPagamento(request.tipoPagamento());
        conta.setStatus(StatusContaPagar.PENDENTE);
        conta.setOrigem(origem);
        conta.setAnimal(animal);
        conta.setObservacao(normalizarOpcional(request.observacao()));

        gerarParcelas(conta, request);
        validarSomaParcelas(conta);
        return toResponseDTO(contaPagarRepository.save(conta));
    }

    @Transactional(readOnly = true)
    public List<ContaPagarResponseDTO> listar(
            StatusContaPagar status,
            CategoriaContaPagar categoria,
            String fornecedor,
            LocalDate inicio,
            LocalDate fim
    ) {
        if (inicio != null && fim != null && inicio.isAfter(fim)) {
            throw new IllegalArgumentException("A data inicial não pode ser posterior à data final.");
        }

        return contaPagarRepository.findAll().stream()
                .filter(conta -> status == null || conta.getStatus() == status)
                .filter(conta -> categoria == null || conta.getCategoria() == categoria)
                .filter(conta -> fornecedor == null || fornecedor.isBlank()
                        || conta.getFornecedor().toLowerCase(Locale.ROOT)
                        .contains(fornecedor.trim().toLowerCase(Locale.ROOT)))
                .filter(conta -> dentroPeriodoVencimento(conta, inicio, fim))
                .sorted(Comparator.comparing(this::vencimentoMaisProximo)
                        .thenComparing(ContaPagar::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ContaPagarResponseDTO buscarPorId(Long id) {
        return toResponseDTO(buscarContaPorId(id));
    }

    @Transactional
    public ContaPagarResponseDTO registrarPagamento(
            Long parcelaId,
            RegistrarPagamentoParcelaRequestDTO request
    ) {
        ContaPagar conta = contaPagarRepository.findByParcelaIdForUpdate(parcelaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parcela de conta a pagar não encontrada com id: " + parcelaId
                ));
        ParcelaContaPagar parcela = conta.getParcelas().stream()
                .filter(item -> item.getId().equals(parcelaId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parcela de conta a pagar não encontrada com id: " + parcelaId
                ));

        if (conta.getStatus() == StatusContaPagar.CANCELADA) {
            throw new IllegalArgumentException("A conta está cancelada.");
        }
        if (parcela.getStatus() == StatusParcelaContaPagar.PAGA) {
            throw new IllegalArgumentException("A parcela já está paga.");
        }
        if (parcela.getStatus() == StatusParcelaContaPagar.CANCELADA) {
            throw new IllegalArgumentException("Uma parcela cancelada não pode ser paga.");
        }
        if (request == null || request.dataPagamento() == null || request.formaPagamento() == null) {
            throw new IllegalArgumentException("Data e forma de pagamento são obrigatórias.");
        }

        parcela.setDataPagamento(request.dataPagamento());
        parcela.setFormaPagamento(request.formaPagamento());
        parcela.setStatus(StatusParcelaContaPagar.PAGA);
        atualizarStatusConta(conta);
        return toResponseDTO(conta);
    }

    @Transactional
    public ContaPagarResponseDTO cancelar(Long id) {
        ContaPagar conta = buscarContaPorIdParaAtualizacao(id);
        if (conta.getStatus() == StatusContaPagar.PAGA) {
            throw new IllegalArgumentException("Uma conta totalmente paga não pode ser cancelada.");
        }
        if (conta.getStatus() == StatusContaPagar.CANCELADA) {
            return toResponseDTO(conta);
        }

        conta.setStatus(StatusContaPagar.CANCELADA);
        conta.getParcelas().stream()
                .filter(parcela -> parcela.getStatus() == StatusParcelaContaPagar.PENDENTE
                        || parcela.getStatus() == StatusParcelaContaPagar.ATRASADA)
                .forEach(parcela -> parcela.setStatus(StatusParcelaContaPagar.CANCELADA));
        return toResponseDTO(conta);
    }

    @Transactional(readOnly = true)
    public ContaPagarResumoDTO buscarResumo() {
        LocalDate hoje = LocalDate.now();
        YearMonth mesAtual = YearMonth.from(hoje);
        BigDecimal totalAPagar = BigDecimal.ZERO;
        BigDecimal totalVencido = BigDecimal.ZERO;
        BigDecimal totalProximos7Dias = BigDecimal.ZERO;
        BigDecimal totalPagoMesAtual = BigDecimal.ZERO;
        long quantidadeVencidas = 0;

        for (ContaPagar conta : contaPagarRepository.findAll()) {
            for (ParcelaContaPagar parcela : conta.getParcelas()) {
                if (parcela.getStatus() == StatusParcelaContaPagar.PAGA) {
                    if (parcela.getDataPagamento() != null
                            && YearMonth.from(parcela.getDataPagamento()).equals(mesAtual)) {
                        totalPagoMesAtual = totalPagoMesAtual.add(parcela.getValor());
                    }
                    continue;
                }
                if (conta.getStatus() == StatusContaPagar.CANCELADA
                        || parcela.getStatus() == StatusParcelaContaPagar.CANCELADA) {
                    continue;
                }

                totalAPagar = totalAPagar.add(parcela.getValor());
                if (parcela.getDataVencimento().isBefore(hoje)) {
                    totalVencido = totalVencido.add(parcela.getValor());
                    quantidadeVencidas++;
                } else if (!parcela.getDataVencimento().isAfter(hoje.plusDays(7))) {
                    totalProximos7Dias = totalProximos7Dias.add(parcela.getValor());
                }
            }
        }

        return new ContaPagarResumoDTO(
                monetario(totalAPagar),
                monetario(totalVencido),
                monetario(totalProximos7Dias),
                monetario(totalPagoMesAtual),
                quantidadeVencidas
        );
    }

    private ContaPagar buscarContaPorId(Long id) {
        return contaPagarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta a pagar não encontrada com id: " + id));
    }

    private ContaPagar buscarContaPorIdParaAtualizacao(Long id) {
        return contaPagarRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conta a pagar não encontrada com id: " + id));
    }

    private void atualizarStatusConta(ContaPagar conta) {
        if (conta.getStatus() == StatusContaPagar.CANCELADA) {
            return;
        }
        long pagas = conta.getParcelas().stream()
                .filter(parcela -> parcela.getStatus() == StatusParcelaContaPagar.PAGA)
                .count();
        long validas = conta.getParcelas().stream()
                .filter(parcela -> parcela.getStatus() != StatusParcelaContaPagar.CANCELADA)
                .count();

        if (validas > 0 && pagas == validas) {
            conta.setStatus(StatusContaPagar.PAGA);
        } else if (pagas > 0) {
            conta.setStatus(StatusContaPagar.PARCIALMENTE_PAGA);
        } else {
            conta.setStatus(StatusContaPagar.PENDENTE);
        }
    }

    private void gerarParcelas(ContaPagar conta, CriarContaPagarRequestDTO request) {
        switch (request.tipoPagamento()) {
            case A_VISTA -> conta.adicionarParcela(criarParcela(1, conta.getValorTotal(), conta.getDataCompra()));
            case PRAZO -> gerarParcelaPrazo(conta, request.dataVencimento());
            case PARCELADO -> gerarParcelasParceladas(
                    conta,
                    request.quantidadeParcelas(),
                    request.primeiroVencimento(),
                    request.intervaloDias()
            );
        }
    }

    private void gerarParcelaPrazo(ContaPagar conta, LocalDate dataVencimento) {
        if (dataVencimento == null) {
            throw new IllegalArgumentException("A data de vencimento é obrigatória para pagamento a prazo.");
        }
        validarVencimentoNaoAnteriorCompra(conta.getDataCompra(), dataVencimento);
        conta.adicionarParcela(criarParcela(1, conta.getValorTotal(), dataVencimento));
    }

    private void gerarParcelasParceladas(
            ContaPagar conta,
            Integer quantidadeParcelas,
            LocalDate primeiroVencimento,
            Integer intervaloDias
    ) {
        if (quantidadeParcelas == null || quantidadeParcelas < 2) {
            throw new IllegalArgumentException("A quantidade de parcelas deve ser maior ou igual a 2.");
        }
        if (quantidadeParcelas > MAXIMO_PARCELAS) {
            throw new IllegalArgumentException("A quantidade de parcelas não pode ser maior que 360.");
        }
        if (primeiroVencimento == null) {
            throw new IllegalArgumentException("O primeiro vencimento é obrigatório para pagamento parcelado.");
        }
        if (intervaloDias == null || intervaloDias <= 0) {
            throw new IllegalArgumentException("O intervalo entre parcelas deve ser maior que zero.");
        }
        if (intervaloDias > MAXIMO_INTERVALO_DIAS) {
            throw new IllegalArgumentException("O intervalo entre parcelas não pode ser maior que 3650 dias.");
        }
        validarVencimentoNaoAnteriorCompra(conta.getDataCompra(), primeiroVencimento);

        List<BigDecimal> valores = distribuirValor(conta.getValorTotal(), quantidadeParcelas);
        for (int indice = 0; indice < quantidadeParcelas; indice++) {
            conta.adicionarParcela(criarParcela(
                    indice + 1,
                    valores.get(indice),
                    primeiroVencimento.plusDays((long) indice * intervaloDias)
            ));
        }
    }

    private List<BigDecimal> distribuirValor(BigDecimal valorTotal, int quantidadeParcelas) {
        BigDecimal valorBase = valorTotal.divide(
                BigDecimal.valueOf(quantidadeParcelas),
                ESCALA_MONETARIA,
                RoundingMode.DOWN
        );
        if (valorBase.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "O valor total é insuficiente para a quantidade de parcelas informada."
            );
        }
        List<BigDecimal> valores = new ArrayList<>();
        BigDecimal somaAnteriores = BigDecimal.ZERO;

        for (int indice = 0; indice < quantidadeParcelas - 1; indice++) {
            valores.add(valorBase);
            somaAnteriores = somaAnteriores.add(valorBase);
        }
        valores.add(monetario(valorTotal.subtract(somaAnteriores)));
        return valores;
    }

    private void validarVencimentoNaoAnteriorCompra(LocalDate dataCompra, LocalDate dataVencimento) {
        if (dataVencimento.isBefore(dataCompra)) {
            throw new IllegalArgumentException("A data de vencimento não pode ser anterior à data da compra.");
        }
    }

    private ParcelaContaPagar criarParcela(int numero, BigDecimal valor, LocalDate vencimento) {
        ParcelaContaPagar parcela = new ParcelaContaPagar();
        parcela.setNumeroParcela(numero);
        parcela.setValor(monetario(valor));
        parcela.setDataVencimento(vencimento);
        parcela.setStatus(StatusParcelaContaPagar.PENDENTE);
        return parcela;
    }

    private void validarSomaParcelas(ContaPagar conta) {
        BigDecimal soma = conta.getParcelas().stream()
                .map(ParcelaContaPagar::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (soma.compareTo(conta.getValorTotal()) != 0) {
            throw new IllegalArgumentException("A soma das parcelas deve ser igual ao valor total da conta.");
        }
    }

    private boolean dentroPeriodoVencimento(ContaPagar conta, LocalDate inicio, LocalDate fim) {
        if (inicio == null && fim == null) {
            return true;
        }
        return conta.getParcelas().stream().anyMatch(parcela ->
                (inicio == null || !parcela.getDataVencimento().isBefore(inicio))
                        && (fim == null || !parcela.getDataVencimento().isAfter(fim))
        );
    }

    private LocalDate vencimentoMaisProximo(ContaPagar conta) {
        return conta.getParcelas().stream()
                .filter(parcela -> parcela.getStatus() != StatusParcelaContaPagar.PAGA
                        && parcela.getStatus() != StatusParcelaContaPagar.CANCELADA)
                .map(ParcelaContaPagar::getDataVencimento)
                .min(LocalDate::compareTo)
                .orElse(LocalDate.MAX);
    }

    private ContaPagarResponseDTO toResponseDTO(ContaPagar conta) {
        List<ParcelaContaPagarResponseDTO> parcelas = conta.getParcelas().stream()
                .map(this::toParcelaResponseDTO)
                .toList();
        BigDecimal valorPago = conta.getParcelas().stream()
                .filter(parcela -> parcela.getStatus() == StatusParcelaContaPagar.PAGA)
                .map(ParcelaContaPagar::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ContaPagarResponseDTO(
                conta.getId(),
                conta.getDescricao(),
                conta.getCategoria(),
                conta.getFornecedor(),
                conta.getValorTotal(),
                monetario(valorPago),
                monetario(conta.getValorTotal().subtract(valorPago)),
                conta.getDataCompra(),
                conta.getTipoPagamento(),
                conta.getStatus(),
                conta.getOrigem(),
                conta.getAnimal() != null ? conta.getAnimal().getId() : null,
                conta.getObservacao(),
                parcelas.size(),
                parcelas,
                conta.getCriadoEm()
        );
    }

    private ParcelaContaPagarResponseDTO toParcelaResponseDTO(ParcelaContaPagar parcela) {
        LocalDate hoje = LocalDate.now();
        boolean atrasada = parcela.getDataPagamento() == null
                && parcela.getDataVencimento().isBefore(hoje)
                && parcela.getStatus() != StatusParcelaContaPagar.CANCELADA;
        StatusParcelaContaPagar status = atrasada ? StatusParcelaContaPagar.ATRASADA : parcela.getStatus();
        Long dias = parcela.getDataPagamento() == null
                ? ChronoUnit.DAYS.between(hoje, parcela.getDataVencimento())
                : null;
        return new ParcelaContaPagarResponseDTO(
                parcela.getId(),
                parcela.getNumeroParcela(),
                parcela.getValor(),
                parcela.getDataVencimento(),
                parcela.getDataPagamento(),
                status,
                parcela.getFormaPagamento(),
                dias,
                atrasada
        );
    }

    private BigDecimal monetario(BigDecimal valor) {
        return valor.setScale(ESCALA_MONETARIA, RoundingMode.HALF_UP);
    }

    private String normalizarOpcional(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
