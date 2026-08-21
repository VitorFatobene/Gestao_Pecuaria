package gestao.pecuaria.backend.movimentacao.repository;

import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovimentacaoAnimalRepository extends JpaRepository<MovimentacaoAnimal, Long> {

    List<MovimentacaoAnimal> findByAnimalIdOrderByDataEntradaDesc(Long animalId);

    Optional<MovimentacaoAnimal> findByAnimalIdAndDataSaidaIsNull(Long animalId);

    List<MovimentacaoAnimal> findByAnimalIdInAndDataSaidaIsNull(List<Long> animalIds);

    @EntityGraph(attributePaths = "animal")
    List<MovimentacaoAnimal> findByPastoIdAndDataSaidaIsNull(Long pastoId);

    @EntityGraph(attributePaths = {"animal", "pasto"})
    List<MovimentacaoAnimal> findAllByOrderByDataEntradaDescIdDesc();

    List<MovimentacaoAnimal> findByPastoIdOrderByDataEntradaDesc(Long pastoId);
}
