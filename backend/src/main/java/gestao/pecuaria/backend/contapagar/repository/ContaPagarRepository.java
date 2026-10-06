package gestao.pecuaria.backend.contapagar.repository;

import gestao.pecuaria.backend.contapagar.entity.ContaPagar;
import gestao.pecuaria.backend.contapagar.enums.OrigemContaPagar;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContaPagarRepository extends JpaRepository<ContaPagar, Long> {

    @Override
    @EntityGraph(attributePaths = "parcelas")
    List<ContaPagar> findAll();

    @Override
    @EntityGraph(attributePaths = "parcelas")
    Optional<ContaPagar> findById(Long id);

    @EntityGraph(attributePaths = "parcelas")
    Optional<ContaPagar> findByAnimalIdAndOrigem(Long animalId, OrigemContaPagar origem);

    @EntityGraph(attributePaths = "parcelas")
    List<ContaPagar> findByAnimalIdInAndOrigem(List<Long> animalIds, OrigemContaPagar origem);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ContaPagar c where c.id = :id")
    Optional<ContaPagar> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select c from ContaPagar c
            where c.id = (
                select p.contaPagar.id from ParcelaContaPagar p where p.id = :parcelaId
            )
            """)
    Optional<ContaPagar> findByParcelaIdForUpdate(@Param("parcelaId") Long parcelaId);
}
