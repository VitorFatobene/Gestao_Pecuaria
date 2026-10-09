package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {

    List<Animal> findAllByUsuarioId(Long usuarioId);

    Optional<Animal> findByIdAndUsuarioId(Long id, Long usuarioId);

    List<Animal> findByPastoIdAndStatusAndUsuarioId(Long pastoId, StatusAnimal status, Long usuarioId);

    List<Animal> findByDataCompraBetweenAndStatusAndUsuarioId(
            LocalDate inicio,
            LocalDate fim,
            StatusAnimal status,
            Long usuarioId
    );

    List<Animal> findByDataCompraBetweenAndUsuarioId(LocalDate inicio, LocalDate fim, Long usuarioId);

    List<Animal> findByLoteIdAndUsuarioId(Long loteId, Long usuarioId);

    List<Animal> findByIdInAndUsuarioId(List<Long> ids, Long usuarioId);

    long countByLoteIdAndUsuarioId(Long loteId, Long usuarioId);

    boolean existsByLoteIdAndUsuarioId(Long loteId, Long usuarioId);

    long countByStatusAndUsuarioId(StatusAnimal status, Long usuarioId);

    long countByUsuarioId(Long usuarioId);

    @EntityGraph(attributePaths = "pasto")
    List<Animal> findTop5ByStatusAndUsuarioIdOrderByIdDesc(StatusAnimal status, Long usuarioId);

    List<Animal> findTop5ByUsuarioIdOrderByIdDesc(Long usuarioId);

    @Query("""
            SELECT COALESCE(SUM(COALESCE(a.valorPago, 0) + COALESCE(a.valorFrete, 0)), 0)
            FROM Animal a
            WHERE a.usuario.id = :usuarioId
            """)
    BigDecimal somarTotalGastoPorUsuario(@Param("usuarioId") Long usuarioId);
}
