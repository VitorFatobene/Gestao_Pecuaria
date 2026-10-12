package gestao.pecuaria.backend.venda;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.lote.Lote;
import gestao.pecuaria.backend.lote.LoteRepository;
import gestao.pecuaria.backend.lote.enums.StatusLote;
import gestao.pecuaria.backend.movimentacao.service.MovimentacaoAnimalService;
import gestao.pecuaria.backend.pagamento.dto.CondicaoPagamentoDTO;
import gestao.pecuaria.backend.pagamento.dto.PagamentoResumoDTO;
import gestao.pecuaria.backend.pagamento.dto.PagamentoVendaResponseDTO;
import gestao.pecuaria.backend.pagamento.entity.PagamentoVenda;
import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import gestao.pecuaria.backend.pagamento.enums.StatusPagamento;
import gestao.pecuaria.backend.pagamento.repository.PagamentoVendaRepository;
import gestao.pecuaria.backend.pagamento.service.PagamentoService;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioAutenticadoService;
import gestao.pecuaria.backend.venda.dto.RegistrarRecebimentoVendaRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaLoteRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaResponseDTO;
import gestao.pecuaria.backend.venda.enums.StatusVenda;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendaService {

    private final VendaRepository vendaRepository;
    private final LoteRepository loteRepository;
    private final AnimalRepository animalRepository;
    private final PagamentoService pagamentoService;
    private final PagamentoVendaRepository pagamentoVendaRepository;
    private final MovimentacaoAnimalService movimentacaoAnimalService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    @Transactional
    public VendaResponseDTO criar(VendaRequestDTO request) {
        Usuario usuario = usuarioAutenticadoService.getUsuarioAutenticado();
        Lote lote = loteRepository.findByIdAndUsuarioId(request.loteId(), usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Lote não encontrado com o ID: " + request.loteId()));

        validarElegibilidadeVenda(lote);

        if (vendaRepository.existsByLoteIdAndUsuarioId(request.loteId(), usuario.getId())) {
            throw new IllegalArgumentException("Já existe um registro de venda para este lote.");
        }

        Venda venda = new Venda();
        venda.setLote(lote);
        venda.setNomeComprador(request.nomeComprador());
        venda.setValorTotal(request.valorTotal());
        venda.setDataVenda(request.dataVenda());
        venda.setPesoKgVenda(request.pesoKgVenda());
        venda.setUsuario(usuario);

        Venda vendaSalva = vendaRepository.save(venda);
        List<Animal> animais = animalRepository.findByLoteIdAndUsuarioId(lote.getId(), usuario.getId());
        finalizarAnimaisVendidos(animais, request.dataVenda());

        lote.setStatus(StatusLote.VENDIDO);
        loteRepository.save(lote);

        return toResponseDTO(vendaSalva, List.of(), animais);
    }

    @Transactional
    public VendaResponseDTO realizarVendaLote(VendaLoteRequestDTO request) {
        Usuario usuario = usuarioAutenticadoService.getUsuarioAutenticado();
        Lote lote = loteRepository.findByIdAndUsuarioId(request.loteId(), usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Lote não encontrado com o ID: " + request.loteId()));

        validarLoteParaVendaCompleta(lote);

        List<Animal> animais = animalRepository.findByLoteIdAndUsuarioId(lote.getId(), usuario.getId());
        validarAnimaisParaVenda(animais);

        if (vendaRepository.existsByLoteIdAndUsuarioId(request.loteId(), usuario.getId())) {
            throw new IllegalArgumentException("Já existe um registro de venda para este lote.");
        }

        BigDecimal pesoTotalKg = animais.stream()
                .map(animal -> valorOuZero(animal.getPesoKg()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Venda venda = new Venda();
        venda.setLote(lote);
        venda.setNomeComprador(request.comprador());
        venda.setValorTotal(request.valorTotal());
        venda.setDataVenda(request.dataVenda());
        venda.setPesoKgVenda(pesoTotalKg);
        venda.setUsuario(usuario);

        Venda vendaSalva = vendaRepository.save(venda);
        List<PagamentoVenda> pagamentos = gerarPagamentos(vendaSalva, request.condicaoPagamento());

        lote.setStatus(StatusLote.VENDIDO);
        loteRepository.save(lote);
        finalizarAnimaisVendidos(animais, request.dataVenda());

        return toResponseDTO(vendaSalva, pagamentos, animais);
    }

    public List<VendaResponseDTO> listarTodos() {
        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();
        return vendaRepository.findAllByUsuarioId(usuarioId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public VendaResponseDTO buscarPorId(Long id) {
        return toResponseDTO(buscarEntidadePorId(id));
    }

    public VendaResponseDTO buscarPorLote(Long loteId) {
        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();
        return vendaRepository.findByLoteIdAndUsuarioId(loteId, usuarioId)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Venda não encontrada para o lote com o ID: " + loteId));
    }

    public List<VendaResponseDTO> listarPorDataVenda(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null) {
            throw new IllegalArgumentException("As datas inicial e final são obrigatórias.");
        }

        if (inicio.isAfter(fim)) {
            throw new IllegalArgumentException("A data inicial não pode ser maior que a data final.");
        }

        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();
        return vendaRepository.findByDataVendaBetweenAndUsuarioId(inicio, fim, usuarioId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public VendaResponseDTO registrarRecebimento(Long id, RegistrarRecebimentoVendaRequestDTO request) {
        Venda venda = buscarEntidadePorIdParaAtualizacao(id);
        List<PagamentoVenda> pagamentos = pagamentoVendaRepository.findByVendaIdOrderByNumeroParcelaAsc(venda.getId());

        if (calcularStatusVenda(pagamentos) == StatusVenda.CANCELADA) {
            throw new IllegalArgumentException("Venda cancelada não pode ser recebida.");
        }

        BigDecimal saldoRestante = calcularSaldoRestante(venda, pagamentos);
        if (saldoRestante.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("A venda já está quitada.");
        }

        LocalDate dataPagamento = request.dataPagamento() != null ? request.dataPagamento() : LocalDate.now();
        List<PagamentoVenda> pagamentosAbertos = pagamentos.stream()
                .filter(pagamento -> pagamento.getStatus() != StatusPagamento.PAGO)
                .filter(pagamento -> pagamento.getStatus() != StatusPagamento.CANCELADO)
                .toList();

        if (pagamentosAbertos.isEmpty()) {
            PagamentoVenda pagamento = criarPagamentoRecebido(
                    venda,
                    proximoNumeroParcela(pagamentos),
                    saldoRestante,
                    dataPagamento,
                    request.formaPagamento()
            );
            pagamentoVendaRepository.save(pagamento);
            pagamentos = pagamentoVendaRepository.findByVendaIdOrderByNumeroParcelaAsc(venda.getId());
        } else {
            pagamentosAbertos.forEach(pagamento -> registrarPagamento(pagamento, dataPagamento, request.formaPagamento()));
            pagamentoVendaRepository.saveAll(pagamentosAbertos);
        }

        List<Animal> animais = animalRepository.findByLoteIdAndUsuarioId(venda.getLote().getId(), venda.getUsuario().getId());
        return toResponseDTO(venda, pagamentos, animais);
    }

    private Venda buscarEntidadePorId(Long id) {
        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();
        return vendaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Venda não encontrada com o ID: " + id));
    }

    private Venda buscarEntidadePorIdParaAtualizacao(Long id) {
        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();
        return vendaRepository.findByIdAndUsuarioIdForUpdate(id, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Venda não encontrada com o ID: " + id));
    }

    private void validarElegibilidadeVenda(Lote lote) {
        if (!animalRepository.existsByLoteIdAndUsuarioId(lote.getId(), lote.getUsuario().getId())) {
            throw new IllegalArgumentException("Não é possível vender um lote sem animais.");
        }

        if (lote.getStatus() == StatusLote.VENDIDO) {
            throw new IllegalArgumentException("Este lote já foi vendido.");
        }

        if (lote.getStatus() == StatusLote.CANCELADO) {
            throw new IllegalArgumentException("Não é possível vender um lote cancelado.");
        }
    }

    private void validarLoteParaVendaCompleta(Lote lote) {
        if (lote.getStatus() == StatusLote.VENDIDO) {
            throw new IllegalArgumentException("Este lote já foi vendido.");
        }

        if (lote.getStatus() == StatusLote.CANCELADO) {
            throw new IllegalArgumentException("Não é possível vender um lote cancelado.");
        }

        if (lote.getStatus() != StatusLote.ABERTO) {
            throw new IllegalArgumentException("Apenas lotes abertos podem ser vendidos.");
        }
    }

    private void validarAnimaisParaVenda(List<Animal> animais) {
        if (animais.isEmpty()) {
            throw new IllegalArgumentException("Não é possível vender um lote sem animais.");
        }

        if (animais.stream().anyMatch(animal -> animal.getStatus() == StatusAnimal.VENDIDO)) {
            throw new IllegalArgumentException("Não é possível vender lote com animal já vendido.");
        }

        if (animais.stream().anyMatch(animal -> animal.getStatus() != StatusAnimal.ATIVO)) {
            throw new IllegalArgumentException("Apenas animais ativos podem ser vendidos.");
        }
    }

    private List<PagamentoVenda> gerarPagamentos(Venda venda, CondicaoPagamentoDTO condicaoPagamento) {
        if (condicaoPagamento == null || condicaoPagamento.tipoPagamento() == null) {
            throw new IllegalArgumentException("O tipo de pagamento é obrigatório.");
        }

        return switch (condicaoPagamento.tipoPagamento()) {
            case A_VISTA -> pagamentoService.gerarPagamentoVista(venda, null);
            case PRAZO -> pagamentoService.gerarPagamentoPrazo(venda, condicaoPagamento, null);
            case PARCELADO -> pagamentoService.gerarPagamentoParcelado(venda, condicaoPagamento, null);
        };
    }

    private void finalizarAnimaisVendidos(List<Animal> animais, LocalDate dataVenda) {
        animais.forEach(animal -> {
            animal.setStatus(StatusAnimal.VENDIDO);
            animal.setPasto(null);
            movimentacaoAnimalService.encerrarMovimentacaoAtual(animal, dataVenda);
        });

        animalRepository.saveAll(animais);
    }

    private VendaResponseDTO toResponseDTO(Venda venda) {
        Lote lote = venda.getLote();
        List<Animal> animais = animalRepository.findByLoteIdAndUsuarioId(lote.getId(), lote.getUsuario().getId());
        List<PagamentoVenda> pagamentos = pagamentoVendaRepository.findByVendaIdOrderByNumeroParcelaAsc(venda.getId());

        return toResponseDTO(venda, pagamentos, animais);
    }

    private VendaResponseDTO toResponseDTO(Venda venda, List<PagamentoVenda> pagamentos, List<Animal> animais) {
        Lote lote = venda.getLote();
        BigDecimal pesoTotalKg = animais.stream()
                .map(animal -> valorOuZero(animal.getPesoKg()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new VendaResponseDTO(
                venda.getId(),
                lote.getId(),
                lote.getNome(),
                lote.getStatus(),
                (long) animais.size(),
                pesoTotalKg,
                venda.getNomeComprador(),
                venda.getValorTotal(),
                venda.getDataVenda(),
                venda.getPesoKgVenda(),
                calcularPesoArrobaVenda(venda.getPesoKgVenda()),
                calcularStatusVenda(pagamentos),
                toPagamentoResumoDTO(venda, pagamentos),
                pagamentos.stream().map(this::toPagamentoResponseDTO).toList(),
                venda.getCriadoEm()
        );
    }

    private PagamentoResumoDTO toPagamentoResumoDTO(Venda venda, List<PagamentoVenda> pagamentos) {
        if (pagamentos.isEmpty()) {
            return null;
        }

        int totalParcelas = pagamentos.size();

        if (totalParcelas == 1) {
            PagamentoVenda pagamento = pagamentos.getFirst();

            if (pagamento.getStatus() == StatusPagamento.PAGO && venda.getDataVenda().equals(pagamento.getDataPagamento())) {
                return new PagamentoResumoDTO("A_VISTA", null, null);
            }

            return new PagamentoResumoDTO("PRAZO", pagamento.getNumeroParcela(), totalParcelas);
        }

        Integer parcelaAtual = pagamentos.stream()
                .filter(pagamento -> pagamento.getStatus() == StatusPagamento.PENDENTE || pagamento.getStatus() == StatusPagamento.ATRASADO)
                .map(PagamentoVenda::getNumeroParcela)
                .findFirst()
                .orElse(totalParcelas);

        return new PagamentoResumoDTO("PARCELADO", parcelaAtual, totalParcelas);
    }

    private PagamentoVendaResponseDTO toPagamentoResponseDTO(PagamentoVenda pagamento) {
        return new PagamentoVendaResponseDTO(
                pagamento.getId(),
                pagamento.getNumeroParcela(),
                pagamento.getValor(),
                pagamento.getDataVencimento(),
                pagamento.getDataPagamento(),
                pagamento.getStatus(),
                pagamento.getFormaPagamento()
        );
    }

    private BigDecimal calcularSaldoRestante(Venda venda, List<PagamentoVenda> pagamentos) {
        BigDecimal totalRecebido = pagamentos.stream()
                .filter(pagamento -> pagamento.getStatus() == StatusPagamento.PAGO)
                .map(PagamentoVenda::getValor)
                .map(this::valorOuZero)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return venda.getValorTotal().subtract(totalRecebido).setScale(2, RoundingMode.HALF_UP);
    }

    private void registrarPagamento(PagamentoVenda pagamento, LocalDate dataPagamento, FormaPagamento formaPagamento) {
        pagamento.setStatus(StatusPagamento.PAGO);
        pagamento.setDataPagamento(dataPagamento);
        pagamento.setFormaPagamento(formaPagamento);
    }

    private PagamentoVenda criarPagamentoRecebido(
            Venda venda,
            int numeroParcela,
            BigDecimal valor,
            LocalDate dataPagamento,
            FormaPagamento formaPagamento
    ) {
        PagamentoVenda pagamento = new PagamentoVenda();
        pagamento.setVenda(venda);
        pagamento.setNumeroParcela(numeroParcela);
        pagamento.setValor(valor.setScale(2, RoundingMode.HALF_UP));
        pagamento.setDataVencimento(dataPagamento);
        pagamento.setDataPagamento(dataPagamento);
        pagamento.setStatus(StatusPagamento.PAGO);
        pagamento.setFormaPagamento(formaPagamento);
        return pagamento;
    }

    private int proximoNumeroParcela(List<PagamentoVenda> pagamentos) {
        return pagamentos.stream()
                .map(PagamentoVenda::getNumeroParcela)
                .max(Integer::compareTo)
                .orElse(0) + 1;
    }

    private StatusVenda calcularStatusVenda(List<PagamentoVenda> pagamentos) {
        if (!pagamentos.isEmpty() && pagamentos.stream().allMatch(pagamento -> pagamento.getStatus() == StatusPagamento.PAGO)) {
            return StatusVenda.PAGA;
        }

        if (!pagamentos.isEmpty() && pagamentos.stream().allMatch(pagamento -> pagamento.getStatus() == StatusPagamento.CANCELADO)) {
            return StatusVenda.CANCELADA;
        }

        return StatusVenda.AGUARDANDO_PAGAMENTO;
    }

    private BigDecimal calcularPesoArrobaVenda(BigDecimal pesoKgVenda) {
        return pesoKgVenda.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }
}
