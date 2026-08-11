package gestao.pecuaria.backend.venda;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    @Override
    @EntityGraph(attributePaths = "lote")
    List<Venda> findAll();

    @Override
    @EntityGraph(attributePaths = "lote")
    Optional<Venda> findById(Long id);

    @EntityGraph(attributePaths = "lote")
    Optional<Venda> findByLoteId(Long loteId);

    @EntityGraph(attributePaths = "lote")
    List<Venda> findByDataVendaBetween(LocalDate inicio, LocalDate fim);

    @EntityGraph(attributePaths = "lote")
    List<Venda> findTop5ByOrderByDataVendaDescIdDesc();

    boolean existsByLoteId(Long loteId);

    @Query("SELECT COALESCE(SUM(COALESCE(v.valorTotal, 0)), 0) FROM Venda v")
    BigDecimal somarGanhoTotal();
}
