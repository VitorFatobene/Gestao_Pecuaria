package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.dto.AnimalResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnimalService {
    private final AnimalRepository animalRepository;

    public AnimalResponseDTO criar(AnimalRequestDTO animalResquest){
        Animal animal = new Animal();
        animal.setCodigoAnimal(animalResquest.codigoAnimal());
        animal.setRaca(animalResquest.raca());
        animal.setPesoKg(animalResquest.pesoKg());
        animal.setValorPago(animalResquest.valorPago());
        animal.setValorFrete(animalResquest.valorFrete());
        animal.setNomeVendedor(animalResquest.nomeVendedor());
        animal.setDataCompra(animalResquest.dataCompra());
        animal.setImagemUrl(animalResquest.imagemUrl());

        Animal animalSalvo = animalRepository.save(animal);

        return new AnimalResponseDTO(
                animalSalvo.getId(),
                animalSalvo.getCodigoAnimal(),
                animalSalvo.getRaca(),
                animalSalvo.getPesoKg(),
                animalSalvo.getValorPago(),
                animalSalvo.getValorFrete(),
                animalSalvo.getNomeVendedor(),
                animalSalvo.getDataCompra(),
                animalSalvo.getImagemUrl()
        );

    }
}
