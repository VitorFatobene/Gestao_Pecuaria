package gestao.pecuaria.backend.venda;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.pasto.Pasto;
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
    private final AnimalRepository animalRepository;

    @Transactional
    public VendaResponseDTO criar(VendaRequestDTO request) {
        Animal animal = animalRepository.findById(request.animalId())
                .orElseThrow(() -> new ResourceNotFoundException("Animal não encontrado com o ID: " + request.animalId()));

        validarElegibilidadeVenda(animal);

        if (vendaRepository.existsByAnimalId(request.animalId())) {
            throw new IllegalArgumentException("Já existe um registro de venda para este animal.");
        }

        animal.setStatus(StatusAnimal.VENDIDO);
        animal.setPasto(null);
        animalRepository.save(animal);

        Venda venda = new Venda();
        venda.setAnimal(animal);
        venda.setNomeComprador(request.nomeComprador());
        venda.setValorVenda(request.valorVenda());
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

    public VendaResponseDTO buscarPorAnimal(Long animalId) {
        return vendaRepository.findByAnimalId(animalId)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Venda não encontrada para o animal com o ID: " + animalId));
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

    private void validarElegibilidadeVenda(Animal animal) {
        if (animal.getStatus() == StatusAnimal.INATIVO) {
            throw new IllegalArgumentException("Não é possível vender um animal inativo.");
        }

        if (animal.getStatus() == StatusAnimal.VENDIDO) {
            throw new IllegalArgumentException("Este animal já foi vendido.");
        }
    }

    private VendaResponseDTO toResponseDTO(Venda venda) {
        Animal animal = venda.getAnimal();
        Pasto pasto = animal.getPasto();

        return new VendaResponseDTO(
                venda.getId(),
                animal.getId(),
                animal.getCodigoAnimal(),
                venda.getNomeComprador(),
                venda.getValorVenda(),
                venda.getDataVenda(),
                venda.getPesoKgVenda(),
                calcularPesoArrobaVenda(venda.getPesoKgVenda()),
                animal.getRaca(),
                animal.getSexo(),
                animal.getPesoKg(),
                animal.getValorPago(),
                animal.getValorFrete(),
                pasto != null ? pasto.getId() : null,
                pasto != null ? pasto.getNome() : null,
                "CONCLUIDA",
                venda.getCriadoEm()
        );
    }

    private BigDecimal calcularPesoArrobaVenda(BigDecimal pesoKgVenda) {
        return pesoKgVenda.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
    }
}
