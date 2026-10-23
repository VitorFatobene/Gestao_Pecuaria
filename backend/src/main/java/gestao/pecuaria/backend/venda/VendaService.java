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
import gestao.pecuaria.backend.venda.dto.AnimalVendaDetalheDTO;
import gestao.pecuaria.backend.venda.dto.VendaLoteRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaResponseDTO;
import gestao.pecuaria.backend.venda.dto.VendaVisaoGeralDTO;
import gestao.pecuaria.backend.venda.enums.StatusVenda;
import gestao.pecuaria.backend.common.dto.PageResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import jakarta.persistence.criteria.Predicate;

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

    @Transactional(readOnly = true)
    public PageResponseDTO<VendaResponseDTO> listarPaginado(
            Integer page, Integer size, LocalDate inicio, LocalDate fim, Long animalId, StatusVenda status, String busca
    ) {
        validarPeriodo(inicio, fim);
        int pageNumber = Math.max(page != null ? page : 0, 0);
        int pageSize = Math.min(Math.max(size != null ? size : 20, 1), 100);
        Page<Venda> vendas = vendaRepository.findAll(
                criarFiltro(usuarioAutenticadoService.getUsuarioAutenticadoId(), inicio, fim, animalId, status, busca),
                PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Order.desc("dataVenda"), Sort.Order.desc("id")))
        );

        return PageResponseDTO.of(vendas.getContent().stream().map(this::toResponseDTO).toList(), vendas);
    }

    @Transactional(readOnly = true)
    public VendaVisaoGeralDTO buscarVisaoGeral(
            LocalDate inicio, LocalDate fim, Long animalId, StatusVenda status, String busca
    ) {
        validarPeriodo(inicio, fim);
        List<VendaResponseDTO> vendas = vendaRepository.findAll(
                        criarFiltro(usuarioAutenticadoService.getUsuarioAutenticadoId(), inicio, fim, animalId, status, busca),
                        Sort.by(Sort.Order.desc("dataVenda"), Sort.Order.desc("id"))
                ).stream()
                .map(this::toResponseDTO)
                .toList();
        BigDecimal faturamento = vendas.stream().map(VendaResponseDTO::valorTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        long animaisVendidos = vendas.stream().mapToLong(VendaResponseDTO::quantidadeAnimaisLote).sum();
        LocalDate hoje = LocalDate.now();
        long vendasMes = vendas.stream().filter(venda -> YearMonth.from(venda.dataVenda()).equals(YearMonth.from(hoje))).count();

        return new VendaVisaoGeralDTO(
                vendasMes,
                faturamento,
                vendas.isEmpty() ? BigDecimal.ZERO : faturamento.divide(BigDecimal.valueOf(vendas.size()), 2, RoundingMode.HALF_UP),
                animaisVendidos,
                criarFaturamentoMensal(vendas),
                criarAnimaisFiltro(vendas)
        );
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

    private Specification<Venda> criarFiltro(
            Long usuarioId, LocalDate inicio, LocalDate fim, Long animalId, StatusVenda status, String busca
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("usuario").get("id"), usuarioId));

            if (inicio != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dataVenda"), inicio));
            }
            if (fim != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("dataVenda"), fim));
            }
            if (animalId != null) {
                var subquery = query.subquery(Long.class);
                var animal = subquery.from(Animal.class);
                subquery.select(animal.get("id"));
                subquery.where(
                        criteriaBuilder.equal(animal.get("lote").get("id"), root.get("lote").get("id")),
                        criteriaBuilder.equal(animal.get("id"), animalId)
                );
                predicates.add(criteriaBuilder.exists(subquery));
            }
            if (busca != null && !busca.isBlank()) {
                String termo = "%" + busca.trim().toLowerCase() + "%";
                var animaisDaVenda = query.subquery(Long.class);
                var animal = animaisDaVenda.from(Animal.class);
                animaisDaVenda.select(animal.get("id"));
                animaisDaVenda.where(
                        criteriaBuilder.equal(animal.get("lote").get("id"), root.get("lote").get("id")),
                        criteriaBuilder.or(
                                criteriaBuilder.like(animal.get("codigoAnimal").as(String.class), termo),
                                criteriaBuilder.like(criteriaBuilder.lower(animal.get("raca")), termo)
                        )
                );
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("nomeComprador")), termo),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("lote").get("nome")), termo),
                        criteriaBuilder.like(root.get("id").as(String.class), termo),
                        criteriaBuilder.exists(animaisDaVenda)
                ));
            }
            if (status != null) {
                predicates.add(criarPredicadoStatus(root, query, criteriaBuilder, status));
            }
            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Predicate criarPredicadoStatus(
            jakarta.persistence.criteria.Root<Venda> venda,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
            StatusVenda status
    ) {
        Predicate possuiPagamento = criteriaBuilder.exists(subqueryPagamento(venda, query, criteriaBuilder, null));
        Predicate possuiPagamentoNaoPago = criteriaBuilder.exists(subqueryPagamento(venda, query, criteriaBuilder, StatusPagamento.PAGO));
        Predicate possuiPagamentoNaoCancelado = criteriaBuilder.exists(subqueryPagamento(venda, query, criteriaBuilder, StatusPagamento.CANCELADO));
        Predicate paga = criteriaBuilder.and(possuiPagamento, criteriaBuilder.not(possuiPagamentoNaoPago));
        Predicate cancelada = criteriaBuilder.and(possuiPagamento, criteriaBuilder.not(possuiPagamentoNaoCancelado));

        return switch (status) {
            case PAGA -> paga;
            case CANCELADA -> cancelada;
            case AGUARDANDO_PAGAMENTO -> criteriaBuilder.not(criteriaBuilder.or(paga, cancelada));
        };
    }

    private jakarta.persistence.criteria.Subquery<Long> subqueryPagamento(
            jakarta.persistence.criteria.Root<Venda> venda,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
            StatusPagamento statusIgnorado
    ) {
        var subquery = query.subquery(Long.class);
        var pagamento = subquery.from(PagamentoVenda.class);
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(criteriaBuilder.equal(pagamento.get("venda").get("id"), venda.get("id")));
        if (statusIgnorado != null) {
            predicates.add(criteriaBuilder.notEqual(pagamento.get("status"), statusIgnorado));
        }
        subquery.select(pagamento.get("id")).where(predicates.toArray(Predicate[]::new));
        return subquery;
    }

    private List<VendaVisaoGeralDTO.FaturamentoMensalDTO> criarFaturamentoMensal(List<VendaResponseDTO> vendas) {
        YearMonth atual = YearMonth.now();
        List<VendaVisaoGeralDTO.FaturamentoMensalDTO> meses = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM", new Locale("pt", "BR"));

        for (int indice = 5; indice >= 0; indice--) {
            YearMonth mes = atual.minusMonths(indice);
            BigDecimal faturamento = vendas.stream()
                    .filter(venda -> YearMonth.from(venda.dataVenda()).equals(mes))
                    .map(VendaResponseDTO::valorTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            meses.add(new VendaVisaoGeralDTO.FaturamentoMensalDTO(
                    formatter.format(mes.atDay(1)).replace(".", ""), faturamento
            ));
        }
        return meses;
    }

    private List<VendaVisaoGeralDTO.AnimalFiltroDTO> criarAnimaisFiltro(List<VendaResponseDTO> vendas) {
        return vendas.stream()
                .flatMap(venda -> venda.animais().stream())
                .collect(java.util.stream.Collectors.toMap(
                        AnimalVendaDetalheDTO::id,
                        animal -> new VendaVisaoGeralDTO.AnimalFiltroDTO(animal.id(), animal.codigoAnimal(), animal.raca()),
                        (primeiro, segundo) -> primeiro
                ))
                .values()
                .stream()
                .sorted(java.util.Comparator.comparing(VendaVisaoGeralDTO.AnimalFiltroDTO::codigoAnimal))
                .toList();
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio != null && fim != null && inicio.isAfter(fim)) {
            throw new IllegalArgumentException("A data inicial não pode ser maior que a data final.");
        }
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
        List<BigDecimal> valoresAtribuidos = distribuirValorIgualitario(venda.getValorTotal(), animais.size());
        List<AnimalVendaDetalheDTO> animaisDetalhe = criarAnimaisDetalhe(animais, valoresAtribuidos);

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
                venda.getCriadoEm(),
                calcularValorMedioPorArroba(venda.getValorTotal(), pesoTotalKg),
                animaisDetalhe
        );
    }

    private List<AnimalVendaDetalheDTO> criarAnimaisDetalhe(List<Animal> animais, List<BigDecimal> valoresAtribuidos) {
        return java.util.stream.IntStream.range(0, animais.size())
                .mapToObj(indice -> {
                    Animal animal = animais.get(indice);
                    BigDecimal valorAtribuido = valoresAtribuidos.get(indice);

                    return new AnimalVendaDetalheDTO(
                            animal.getId(),
                            animal.getCodigoAnimal(),
                            animal.getRaca(),
                            animal.getSexo(),
                            animal.getPesoKg(),
                            valorAtribuido,
                            calcularValorPorArroba(valorAtribuido, animal.getPesoKg())
                    );
                })
                .toList();
    }

    private List<BigDecimal> distribuirValorIgualitario(BigDecimal valorTotal, int quantidadeAnimais) {
        if (quantidadeAnimais == 0) {
            return List.of();
        }

        BigDecimal totalArredondado = valorOuZero(valorTotal).setScale(2, RoundingMode.HALF_UP);
        BigDecimal valorBase = totalArredondado.divide(BigDecimal.valueOf(quantidadeAnimais), 2, RoundingMode.DOWN);
        BigDecimal valorUltimoAnimal = totalArredondado.subtract(valorBase.multiply(BigDecimal.valueOf(quantidadeAnimais - 1)));

        return java.util.stream.IntStream.range(0, quantidadeAnimais)
                .mapToObj(indice -> indice == quantidadeAnimais - 1 ? valorUltimoAnimal : valorBase)
                .toList();
    }

    private BigDecimal calcularValorMedioPorArroba(BigDecimal valorTotal, BigDecimal pesoTotalKg) {
        return calcularValorPorArroba(valorOuZero(valorTotal), pesoTotalKg);
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

    private BigDecimal calcularValorPorArroba(BigDecimal valor, BigDecimal pesoKg) {
        if (pesoKg == null || pesoKg.signum() <= 0) {
            return null;
        }

        return valor.multiply(BigDecimal.valueOf(30)).divide(pesoKg, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }
}
