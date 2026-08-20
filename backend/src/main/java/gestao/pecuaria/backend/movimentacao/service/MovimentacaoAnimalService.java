package gestao.pecuaria.backend.movimentacao.service;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import gestao.pecuaria.backend.movimentacao.repository.MovimentacaoAnimalRepository;
import gestao.pecuaria.backend.pasto.Pasto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class MovimentacaoAnimalService {

    private final MovimentacaoAnimalRepository movimentacaoAnimalRepository;

    @Transactional
    public MovimentacaoAnimal registrarEntrada(Animal animal, Pasto pasto) {
        if (animal == null || animal.getId() == null || pasto == null) {
            return null;
        }

        return movimentacaoAnimalRepository.findByAnimalIdAndDataSaidaIsNull(animal.getId())
                .orElseGet(() -> criarMovimentacaoEntrada(animal, pasto));
    }

    private MovimentacaoAnimal criarMovimentacaoEntrada(Animal animal, Pasto pasto) {
        MovimentacaoAnimal movimentacao = new MovimentacaoAnimal();
        movimentacao.setAnimal(animal);
        movimentacao.setPasto(pasto);
        movimentacao.setDataEntrada(LocalDate.now());
        movimentacao.setDataSaida(null);

        return movimentacaoAnimalRepository.save(movimentacao);
    }
}
