package gestao.pecuaria.backend.movimentacao.repository;

import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovimentacaoAnimalRepository extends JpaRepository<MovimentacaoAnimal, Long> {

    List<MovimentacaoAnimal> findByAnimalIdAndAnimalUsuarioIdOrderByDataEntradaDesc(Long animalId, Long usuarioId);

    Optional<MovimentacaoAnimal> findByAnimalIdAndAnimalUsuarioIdAndDataSaidaIsNull(Long animalId, Long usuarioId);

    List<MovimentacaoAnimal> findByAnimalIdInAndAnimalUsuarioIdAndDataSaidaIsNull(List<Long> animalIds, Long usuarioId);

    @EntityGraph(attributePaths = "animal")
    List<MovimentacaoAnimal> findByPastoIdAndPastoUsuarioIdAndDataSaidaIsNull(Long pastoId, Long usuarioId);

    @EntityGraph(attributePaths = {"animal", "pasto"})
    List<MovimentacaoAnimal> findByDataSaidaIsNullAndAnimalUsuarioId(Long usuarioId);

    @EntityGraph(attributePaths = {"animal", "pasto"})
    List<MovimentacaoAnimal> findAllByAnimalUsuarioIdOrderByDataEntradaDescIdDesc(Long usuarioId);

    List<MovimentacaoAnimal> findByPastoIdAndPastoUsuarioIdOrderByDataEntradaDesc(Long pastoId, Long usuarioId);
}
