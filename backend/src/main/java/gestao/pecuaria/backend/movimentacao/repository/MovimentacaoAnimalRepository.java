package gestao.pecuaria.backend.movimentacao.repository;

import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovimentacaoAnimalRepository extends JpaRepository<MovimentacaoAnimal, Long> {

    List<MovimentacaoAnimal> findByAnimalIdOrderByDataEntradaDesc(Long animalId);

    Optional<MovimentacaoAnimal> findByAnimalIdAndDataSaidaIsNull(Long animalId);

    List<MovimentacaoAnimal> findByPastoIdOrderByDataEntradaDesc(Long pastoId);
}
