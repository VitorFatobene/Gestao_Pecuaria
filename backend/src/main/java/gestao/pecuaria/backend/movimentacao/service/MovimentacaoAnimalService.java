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

    @Transactional
    public void trocarAnimalDePasto(Animal animal, Pasto novoPasto) {
        if (animal == null || animal.getId() == null || novoPasto == null) {
            throw new IllegalArgumentException("Animal e novo pasto são obrigatórios para troca de pasto.");
        }

        LocalDate dataTroca = LocalDate.now();
        MovimentacaoAnimal movimentacaoAtual = movimentacaoAnimalRepository
                .findByAnimalIdAndDataSaidaIsNull(animal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Animal não possui movimentação atual aberta."));

        movimentacaoAtual.setDataSaida(dataTroca);
        movimentacaoAnimalRepository.save(movimentacaoAtual);

        MovimentacaoAnimal novaMovimentacao = new MovimentacaoAnimal();
        novaMovimentacao.setAnimal(animal);
        novaMovimentacao.setPasto(novoPasto);
        novaMovimentacao.setDataEntrada(dataTroca);
        novaMovimentacao.setDataSaida(null);

        movimentacaoAnimalRepository.save(novaMovimentacao);
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
