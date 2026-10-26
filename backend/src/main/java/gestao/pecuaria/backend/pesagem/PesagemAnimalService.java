package gestao.pecuaria.backend.pesagem;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.AnimalRepository;
import gestao.pecuaria.backend.common.exception.ResourceNotFoundException;
import gestao.pecuaria.backend.pesagem.dto.PesagemAnimalRequestDTO;
import gestao.pecuaria.backend.pesagem.dto.PesagemAnimalResponseDTO;
import gestao.pecuaria.backend.usuario.UsuarioAutenticadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PesagemAnimalService {

    private final PesagemAnimalRepository pesagemAnimalRepository;
    private final AnimalRepository animalRepository;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

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

    /**
     * Registra a única pesagem criada junto com o cadastro do animal. A data de
     * compra representa a entrada do animal e, portanto, o momento do peso inicial.
     */
    public void registrarPesoInicialSeNecessario(Animal animal) {
        BigDecimal pesoInicial = animal.getPesoKg();
        if (pesoInicial == null || pesoInicial.signum() <= 0
                || pesagemAnimalRepository.existsByAnimalId(animal.getId())) {
            return;
        }

        PesagemAnimal pesagemInicial = new PesagemAnimal();
        pesagemInicial.setAnimal(animal);
        pesagemInicial.setPesoKg(pesoInicial);
        pesagemInicial.setDataPesagem(animal.getDataCompra());
        pesagemInicial.setObservacao("Peso inicial");
        pesagemAnimalRepository.save(pesagemInicial);
    }

    @Transactional(readOnly = true)
    public List<PesagemAnimalResponseDTO> listarHistorico(Long animalId) {
        buscarAnimalPorId(animalId);

        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();
        return pesagemAnimalRepository.findByAnimalIdAndAnimalUsuarioIdOrderByDataPesagemAscCriadoEmAscIdAsc(animalId, usuarioId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private Animal buscarAnimalPorId(Long animalId) {
        Long usuarioId = usuarioAutenticadoService.getUsuarioAutenticadoId();
        return animalRepository.findByIdAndUsuarioId(animalId, usuarioId)
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
