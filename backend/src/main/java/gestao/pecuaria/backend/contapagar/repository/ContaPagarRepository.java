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

    @EntityGraph(attributePaths = "parcelas")
    List<ContaPagar> findAllByUsuarioId(Long usuarioId);

    @EntityGraph(attributePaths = "parcelas")
    Optional<ContaPagar> findByIdAndUsuarioId(Long id, Long usuarioId);

    @EntityGraph(attributePaths = "parcelas")
    Optional<ContaPagar> findByAnimalIdAndOrigemAndUsuarioId(Long animalId, OrigemContaPagar origem, Long usuarioId);

    @EntityGraph(attributePaths = "parcelas")
    List<ContaPagar> findByAnimalIdInAndOrigemAndUsuarioId(List<Long> animalIds, OrigemContaPagar origem, Long usuarioId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ContaPagar c where c.id = :id and c.usuario.id = :usuarioId")
    Optional<ContaPagar> findByIdAndUsuarioIdForUpdate(@Param("id") Long id, @Param("usuarioId") Long usuarioId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select c from ContaPagar c
            where c.id = (
                select p.contaPagar.id from ParcelaContaPagar p where p.id = :parcelaId
            )
              and c.usuario.id = :usuarioId
            """)
    Optional<ContaPagar> findByParcelaIdAndUsuarioIdForUpdate(
            @Param("parcelaId") Long parcelaId,
            @Param("usuarioId") Long usuarioId
    );
}
