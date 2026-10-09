package gestao.pecuaria.backend.venda;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    @EntityGraph(attributePaths = "lote")
    List<Venda> findAllByUsuarioId(Long usuarioId);

    @EntityGraph(attributePaths = "lote")
    Optional<Venda> findByIdAndUsuarioId(Long id, Long usuarioId);

    @EntityGraph(attributePaths = "lote")
    Optional<Venda> findByLoteIdAndUsuarioId(Long loteId, Long usuarioId);

    @EntityGraph(attributePaths = "lote")
    List<Venda> findByDataVendaBetweenAndUsuarioId(LocalDate inicio, LocalDate fim, Long usuarioId);

    @EntityGraph(attributePaths = "lote")
    List<Venda> findTop5ByUsuarioIdOrderByDataVendaDescIdDesc(Long usuarioId);

    boolean existsByLoteIdAndUsuarioId(Long loteId, Long usuarioId);

    long countByUsuarioId(Long usuarioId);

    @Query("""
            SELECT COALESCE(SUM(COALESCE(v.valorTotal, 0)), 0)
            FROM Venda v
            WHERE v.usuario.id = :usuarioId
            """)
    BigDecimal somarGanhoTotalPorUsuario(@Param("usuarioId") Long usuarioId);
}
