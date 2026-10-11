package gestao.pecuaria.backend.compra;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.compra.dto.CompraAnimalRequestDTO;
import gestao.pecuaria.backend.compra.dto.CompraAnimalResumoDTO;
import gestao.pecuaria.backend.compra.dto.CompraRequestDTO;
import gestao.pecuaria.backend.compra.dto.CompraResponseDTO;
import gestao.pecuaria.backend.compra.enums.TipoRateioCompra;
import gestao.pecuaria.backend.contapagar.dto.CriarContaPagarRequestDTO;
import gestao.pecuaria.backend.contapagar.enums.CategoriaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.TipoPagamentoContaPagar;
import gestao.pecuaria.backend.contapagar.service.ContaPagarService;
import gestao.pecuaria.backend.movimentacao.service.MovimentacaoAnimalService;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.PastoRepository;
import gestao.pecuaria.backend.usuario.Usuario;
import gestao.pecuaria.backend.usuario.UsuarioAutenticadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CompraService {

    private final CompraRepository compraRepository;
    private final AnimalRepository animalRepository;
    private final PastoRepository pastoRepository;
    private final MovimentacaoAnimalService movimentacaoAnimalService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final ContaPagarService contaPagarService;

    @Transactional
    public CompraResponseDTO criar(CompraRequestDTO request) {
        Usuario usuario = usuarioAutenticadoService.getUsuarioAutenticado();
        validarRequest(request, usuario.getId());
        Map<Long, Pasto> pastosPorId = buscarPastos(request, usuario.getId());
        List<BigDecimal> custosRateados = calcularCustosRateados(request);

        Compra compra = new Compra();
        compra.setUsuario(usuario);
        compra.setFornecedor(request.fornecedor());
        compra.setDataCompra(request.dataCompra());
        compra.setValorTotal(normalizarMoeda(request.valorTotal()));
        compra.setObservacao(request.observacao());
        Compra compraSalva = compraRepository.save(compra);

        for (int index = 0; index < request.animais().size(); index++) {
            CompraAnimalRequestDTO animalRequest = request.animais().get(index);
            Pasto pasto = animalRequest.pastoId() != null ? pastosPorId.get(animalRequest.pastoId()) : null;
            Animal animal = criarAnimal(compraSalva, usuario, animalRequest, custosRateados.get(index), pasto);
            Animal animalSalvo = animalRepository.save(animal);
            registrarEntradaInicialSeNecessario(animalSalvo, pasto);
        }

        contaPagarService.criarParaCompra(
                compraSalva,
                criarContaPagarRequest(compraSalva, request),
                Boolean.TRUE.equals(request.pagamentoRealizadoNoAto()),
                request.dataPagamento(),
                request.formaPagamento()
        );

        return toResponseDTO(compraSalva);
    }

    @Transactional(readOnly = true)
    public List<CompraResponseDTO> listarTodos() {
        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();

        return compraRepository.findAllByUsuarioIdOrderByDataCompraDescIdDesc(usuarioId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CompraResponseDTO buscarPorId(Long id) {
        return toResponseDTO(buscarEntidadePorId(id));
    }

    private Compra buscarEntidadePorId(Long id) {
        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();
        return compraRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Compra nao encontrada com o ID: " + id));
    }

    private void validarRequest(CompraRequestDTO request, Long usuarioId) {
        if (request.animais() == null || request.animais().isEmpty()) {
            throw new IllegalArgumentException("A compra deve possuir ao menos um animal.");
        }

        if (request.valorTotal() == null || request.valorTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor total da compra deve ser maior que zero.");
        }

        validarCodigosDuplicadosNoRequest(request.animais());
        validarCodigosJaExistentes(request.animais());
        validarPastos(request.animais(), usuarioId);
        validarRateioManual(request);
        validarPagamento(request);
    }

    private void validarCodigosDuplicadosNoRequest(List<CompraAnimalRequestDTO> animais) {
        Set<Long> codigos = new HashSet<>();
        for (CompraAnimalRequestDTO animal : animais) {
            if (!codigos.add(animal.codigoAnimal())) {
                throw new IllegalArgumentException("A lista de animais nao pode conter codigos duplicados.");
            }
        }
    }

    private void validarCodigosJaExistentes(List<CompraAnimalRequestDTO> animais) {
        List<Long> codigos = animais.stream()
                .map(CompraAnimalRequestDTO::codigoAnimal)
                .toList();

        if (!animalRepository.findByCodigoAnimalIn(codigos).isEmpty()) {
            throw new IllegalArgumentException("Um ou mais codigos de animais ja estao cadastrados.");
        }
    }

    private void validarPastos(List<CompraAnimalRequestDTO> animais, Long usuarioId) {
        Set<Long> pastoIds = new HashSet<>();
        animais.stream()
                .map(CompraAnimalRequestDTO::pastoId)
                .filter(id -> id != null)
                .forEach(pastoIds::add);

        for (Long pastoId : pastoIds) {
            pastoRepository.findByIdAndUsuarioId(pastoId, usuarioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Pasto não encontrado com o ID: " + pastoId));
        }
    }

    private void validarRateioManual(CompraRequestDTO request) {
        if (request.tipoRateio() != TipoRateioCompra.MANUAL) {
            return;
        }

        BigDecimal totalManual = BigDecimal.ZERO;
        for (CompraAnimalRequestDTO animal : request.animais()) {
            if (animal.valorPago() == null) {
                throw new IllegalArgumentException("O valor pago de cada animal é obrigatório no rateio manual.");
            }
            totalManual = totalManual.add(normalizarMoeda(animal.valorPago()));
        }

        if (totalManual.compareTo(normalizarMoeda(request.valorTotal())) != 0) {
            throw new IllegalArgumentException("A soma dos custos manuais deve ser igual ao valor total da compra.");
        }
    }

    private void validarPagamento(CompraRequestDTO request) {
        if (request.tipoPagamento() == null) {
            throw new IllegalArgumentException("O tipo de pagamento é obrigatório.");
        }

        boolean pagamentoNoAto = Boolean.TRUE.equals(request.pagamentoRealizadoNoAto());
        if (pagamentoNoAto && request.tipoPagamento() != TipoPagamentoContaPagar.A_VISTA) {
            throw new IllegalArgumentException("Pagamento realizado no ato só pode ser informado para compra à vista.");
        }
        if (pagamentoNoAto && (request.dataPagamento() == null || request.formaPagamento() == null)) {
            throw new IllegalArgumentException("Data e forma de pagamento são obrigatórias para pagamento no ato.");
        }
    }

    private Map<Long, Pasto> buscarPastos(CompraRequestDTO request, Long usuarioId) {
        Map<Long, Pasto> pastosPorId = new HashMap<>();
        request.animais().stream()
                .map(CompraAnimalRequestDTO::pastoId)
                .filter(id -> id != null)
                .distinct()
                .forEach(pastoId -> pastosPorId.put(
                        pastoId,
                        pastoRepository.findByIdAndUsuarioId(pastoId, usuarioId)
                                .orElseThrow(() -> new ResourceNotFoundException("Pasto não encontrado com o ID: " + pastoId))
                ));
        return pastosPorId;
    }

    private List<BigDecimal> calcularCustosRateados(CompraRequestDTO request) {
        return switch (request.tipoRateio()) {
            case PROPORCIONAL_PESO -> calcularRateioProporcional(request.valorTotal(), request.animais());
            case IGUAL -> calcularRateioIgual(request.valorTotal(), request.animais().size());
            case MANUAL -> request.animais().stream()
                    .map(animal -> normalizarMoeda(animal.valorPago()))
                    .toList();
        };
    }

    private List<BigDecimal> calcularRateioProporcional(BigDecimal valorTotal, List<CompraAnimalRequestDTO> animais) {
        BigDecimal total = normalizarMoeda(valorTotal);
        BigDecimal pesoTotal = animais.stream()
                .map(CompraAnimalRequestDTO::pesoKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal somaParcial = BigDecimal.ZERO;
        java.util.ArrayList<BigDecimal> custos = new java.util.ArrayList<>();
        for (int index = 0; index < animais.size(); index++) {
            BigDecimal custo = index == animais.size() - 1
                    ? total.subtract(somaParcial).setScale(2, RoundingMode.HALF_UP)
                    : total.multiply(animais.get(index).pesoKg()).divide(pesoTotal, 2, RoundingMode.HALF_UP);
            custos.add(custo);
            somaParcial = somaParcial.add(custo);
        }

        return custos;
    }

    private List<BigDecimal> calcularRateioIgual(BigDecimal valorTotal, int quantidadeAnimais) {
        BigDecimal total = normalizarMoeda(valorTotal);
        BigDecimal somaParcial = BigDecimal.ZERO;
        java.util.ArrayList<BigDecimal> custos = new java.util.ArrayList<>();

        for (int index = 0; index < quantidadeAnimais; index++) {
            BigDecimal custo = index == quantidadeAnimais - 1
                    ? total.subtract(somaParcial).setScale(2, RoundingMode.HALF_UP)
                    : total.divide(BigDecimal.valueOf(quantidadeAnimais), 2, RoundingMode.HALF_UP);
            custos.add(custo);
            somaParcial = somaParcial.add(custo);
        }

        return custos;
    }

    private Animal criarAnimal(
            Compra compra,
            Usuario usuario,
            CompraAnimalRequestDTO request,
            BigDecimal valorPago,
            Pasto pasto
    ) {
        Animal animal = new Animal();
        animal.setCodigoAnimal(request.codigoAnimal());
        animal.setRaca(request.raca());
        animal.setSexo(request.sexo());
        animal.setPesoKg(request.pesoKg());
        animal.setValorPago(valorPago);
        animal.setValorFrete(BigDecimal.ZERO);
        animal.setNomeVendedor(compra.getFornecedor());
        animal.setDataCompra(compra.getDataCompra());
        animal.setImagemUrl(request.imagemUrl());
        animal.setStatus(StatusAnimal.ATIVO);
        animal.setPasto(pasto);
        animal.setCompra(compra);
        animal.setUsuario(usuario);

        return animal;
    }

    private void registrarEntradaInicialSeNecessario(Animal animal, Pasto pasto) {
        if (pasto != null) {
            movimentacaoAnimalService.registrarEntrada(animal, pasto);
        }
    }

    private CriarContaPagarRequestDTO criarContaPagarRequest(Compra compra, CompraRequestDTO request) {
        int quantidadeAnimais = request.animais().size();
        String descricao = quantidadeAnimais == 1
                ? "Compra do animal " + request.animais().getFirst().codigoAnimal()
                : "Compra de " + quantidadeAnimais + " animais";

        return new CriarContaPagarRequestDTO(
                descricao,
                CategoriaContaPagar.ANIMAL,
                compra.getFornecedor(),
                compra.getValorTotal(),
                compra.getDataCompra(),
                request.tipoPagamento(),
                request.dataVencimento(),
                request.quantidadeParcelas(),
                request.primeiroVencimento(),
                request.intervaloDias(),
                request.observacao()
        );
    }

    private CompraResponseDTO toResponseDTO(Compra compra) {
        List<Animal> animais = animalRepository.findByCompraIdAndUsuarioId(compra.getId(), compra.getUsuario().getId());
        BigDecimal pesoTotalKg = animais.stream()
                .map(Animal::getPesoKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal valorMedioAnimal = animais.isEmpty()
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : compra.getValorTotal().divide(BigDecimal.valueOf(animais.size()), 2, RoundingMode.HALF_UP);

        return new CompraResponseDTO(
                compra.getId(),
                compra.getFornecedor(),
                compra.getDataCompra(),
                compra.getValorTotal(),
                compra.getObservacao(),
                animais.size(),
                pesoTotalKg,
                valorMedioAnimal,
                animais.stream()
                        .map(this::toAnimalResumoDTO)
                        .toList(),
                compra.getCriadoEm()
        );
    }

    private CompraAnimalResumoDTO toAnimalResumoDTO(Animal animal) {
        return new CompraAnimalResumoDTO(
                animal.getId(),
                animal.getCodigoAnimal(),
                animal.getRaca(),
                animal.getPesoKg(),
                animal.getValorPago(),
                animal.getStatus()
        );
    }

    private BigDecimal normalizarMoeda(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP);
    }
}
