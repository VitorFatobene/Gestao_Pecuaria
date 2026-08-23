package gestao.pecuaria.backend.pesagem;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.pesagem.dto.PesagemAnimalRequestDTO;
import gestao.pecuaria.backend.pesagem.dto.PesagemAnimalResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PesagemAnimalService {

    private final PesagemAnimalRepository pesagemAnimalRepository;
    private final AnimalRepository animalRepository;

    @Transactional
    public PesagemAnimalResponseDTO registrar(Long animalId, PesagemAnimalRequestDTO request) {
        Animal animal = buscarAnimalPorId(animalId);
        validarDataPesagem(request.dataPesagem());

        PesagemAnimal pesagem = new PesagemAnimal();
        pesagem.setAnimal(animal);
        pesagem.setPesoKg(request.pesoKg());
        pesagem.setDataPesagem(request.dataPesagem());
        pesagem.setObservacao(normalizarObservacao(request.observacao()));

        animal.setPesoKg(request.pesoKg());
        animalRepository.save(animal);

        return toResponseDTO(pesagemAnimalRepository.save(pesagem));
    }

    @Transactional(readOnly = true)
    public List<PesagemAnimalResponseDTO> listarHistorico(Long animalId) {
        buscarAnimalPorId(animalId);

        return pesagemAnimalRepository.findByAnimalIdOrderByDataPesagemDescIdDesc(animalId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private Animal buscarAnimalPorId(Long animalId) {
        return animalRepository.findById(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal não encontrado com o ID: " + animalId));
    }

    private void validarDataPesagem(LocalDate dataPesagem) {
        if (dataPesagem.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("A data da pesagem não pode ser futura.");
        }
    }

    private String normalizarObservacao(String observacao) {
        if (observacao == null || observacao.isBlank()) {
            return null;
        }

        return observacao.trim();
    }

    private PesagemAnimalResponseDTO toResponseDTO(PesagemAnimal pesagem) {
        return new PesagemAnimalResponseDTO(
                pesagem.getId(),
                pesagem.getPesoKg(),
                pesagem.getDataPesagem(),
                pesagem.getObservacao()
        );
    }
}
