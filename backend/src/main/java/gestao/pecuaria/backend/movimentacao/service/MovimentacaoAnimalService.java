package gestao.pecuaria.backend.movimentacao.service;

import gestao.pecuaria.backend.animal.Animal;
import gestao.pecuaria.backend.animal.dto.LocalizacaoAnimalDTO;
import gestao.pecuaria.backend.animal.dto.MovimentacaoAnimalResponseDTO;
import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import gestao.pecuaria.backend.movimentacao.repository.MovimentacaoAnimalRepository;
import gestao.pecuaria.backend.pasto.Pasto;
import gestao.pecuaria.backend.pasto.dto.PastoResumoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

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

    @Transactional(readOnly = true)
    public LocalizacaoAnimalDTO buscarLocalizacaoAtual(Animal animal) {
        return movimentacaoAnimalRepository.findByAnimalIdAndDataSaidaIsNull(animal.getId())
                .map(this::toLocalizacaoAnimalDTO)
                .orElseGet(() -> new LocalizacaoAnimalDTO(animal.getId(), null, null, null));
    }

    @Transactional(readOnly = true)
    public Optional<MovimentacaoAnimal> buscarMovimentacaoAtual(Long animalId) {
        return movimentacaoAnimalRepository.findByAnimalIdAndDataSaidaIsNull(animalId);
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoAnimal> buscarMovimentacoesAtuais(List<Long> animalIds) {
        if (animalIds.isEmpty()) {
            return List.of();
        }

        return movimentacaoAnimalRepository.findByAnimalIdInAndDataSaidaIsNull(animalIds);
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoAnimalResponseDTO> buscarHistoricoMovimentacoes(Long animalId) {
        return movimentacaoAnimalRepository.findByAnimalIdOrderByDataEntradaDesc(animalId)
                .stream()
                .sorted(Comparator
                        .comparing(MovimentacaoAnimal::getDataEntrada, Comparator.reverseOrder())
                        .thenComparing(MovimentacaoAnimal::getId, Comparator.reverseOrder()))
                .map(this::toMovimentacaoAnimalResponseDTO)
                .toList();
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

    private LocalizacaoAnimalDTO toLocalizacaoAnimalDTO(MovimentacaoAnimal movimentacao) {
        LocalDate dataEntrada = movimentacao.getDataEntrada();
        Pasto pasto = movimentacao.getPasto();

        return new LocalizacaoAnimalDTO(
                movimentacao.getAnimal().getId(),
                toPastoResumoDTO(pasto),
                dataEntrada,
                Math.toIntExact(ChronoUnit.DAYS.between(dataEntrada, LocalDate.now()))
        );
    }

    private MovimentacaoAnimalResponseDTO toMovimentacaoAnimalResponseDTO(MovimentacaoAnimal movimentacao) {
        LocalDate dataEntrada = movimentacao.getDataEntrada();
        LocalDate dataSaida = movimentacao.getDataSaida();
        boolean atual = dataSaida == null;
        LocalDate dataFim = atual ? LocalDate.now() : dataSaida;

        return new MovimentacaoAnimalResponseDTO(
                movimentacao.getId(),
                toPastoResumoDTO(movimentacao.getPasto()),
                dataEntrada,
                dataSaida,
                Math.toIntExact(ChronoUnit.DAYS.between(dataEntrada, dataFim)),
                atual
        );
    }

    private PastoResumoDTO toPastoResumoDTO(Pasto pasto) {
        return new PastoResumoDTO(
                pasto.getId(),
                pasto.getNome(),
                pasto.getAreaHectares(),
                null,
                null,
                null,
                null,
                null,
                pasto.getDescricao(),
                pasto.getAtivo(),
                pasto.getCriadoEm()
        );
    }
}
