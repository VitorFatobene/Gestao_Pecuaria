package gestao.pecuaria.backend.venda;

import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.lote.Lote;
import gestao.pecuaria.backend.lote.LoteRepository;
import gestao.pecuaria.backend.lote.enums.StatusLote;
import gestao.pecuaria.backend.venda.dto.VendaRequestDTO;
import gestao.pecuaria.backend.venda.dto.VendaResponseDTO;
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

    @Transactional
    public VendaResponseDTO criar(VendaRequestDTO request) {
        Lote lote = loteRepository.findById(request.loteId())
                .orElseThrow(() -> new ResourceNotFoundException("Lote não encontrado com o ID: " + request.loteId()));

        validarElegibilidadeVenda(lote);

        if (vendaRepository.existsByLoteId(request.loteId())) {
            throw new IllegalArgumentException("Já existe um registro de venda para este lote.");
        }

        Venda venda = new Venda();
        venda.setLote(lote);
        venda.setNomeComprador(request.nomeComprador());
        venda.setValorTotal(request.valorTotal());
        venda.setDataVenda(request.dataVenda());
        venda.setPesoKgVenda(request.pesoKgVenda());

        return toResponseDTO(vendaRepository.save(venda));
    }

    public List<VendaResponseDTO> listarTodos() {
        return vendaRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public VendaResponseDTO buscarPorId(Long id) {
        return toResponseDTO(buscarEntidadePorId(id));
    }

    public VendaResponseDTO buscarPorLote(Long loteId) {
        return vendaRepository.findByLoteId(loteId)
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

        return vendaRepository.findByDataVendaBetween(inicio, fim)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private Venda buscarEntidadePorId(Long id) {
        return vendaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venda não encontrada com o ID: " + id));
    }

    private void validarElegibilidadeVenda(Lote lote) {
        if (!animalRepository.existsByLoteId(lote.getId())) {
            throw new IllegalArgumentException("Não é possível vender um lote sem animais.");
        }

        if (lote.getStatus() == StatusLote.VENDIDO) {
            throw new IllegalArgumentException("Este lote já foi vendido.");
        }
    }

    private VendaResponseDTO toResponseDTO(Venda venda) {
        Lote lote = venda.getLote();
        long quantidadeAnimais = animalRepository.countByLoteId(lote.getId());
        BigDecimal pesoTotalKg = animalRepository.findByLoteId(lote.getId()).stream()
                .map(animal -> valorOuZero(animal.getPesoKg()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new VendaResponseDTO(
                venda.getId(),
                lote.getId(),
                lote.getNome(),
                lote.getStatus(),
                quantidadeAnimais,
                pesoTotalKg,
                venda.getNomeComprador(),
                venda.getValorTotal(),
                venda.getDataVenda(),
                venda.getPesoKgVenda(),
                calcularPesoArrobaVenda(venda.getPesoKgVenda()),
                "CONCLUIDA",
                venda.getCriadoEm()
        );
    }

    private BigDecimal calcularPesoArrobaVenda(BigDecimal pesoKgVenda) {
        return pesoKgVenda.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal valorOuZero(BigDecimal valor) {
        return valor != null ? valor : BigDecimal.ZERO;
    }
}
