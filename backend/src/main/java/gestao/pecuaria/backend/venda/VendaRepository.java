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
    @EntityGraph(attributePaths = {"animal", "animal.pasto"})
    List<Venda> findAll();

    @Override
    @EntityGraph(attributePaths = {"animal", "animal.pasto"})
    Optional<Venda> findById(Long id);

    @EntityGraph(attributePaths = {"animal", "animal.pasto"})
    Optional<Venda> findByAnimalId(Long animalId);

    @EntityGraph(attributePaths = {"animal", "animal.pasto"})
    List<Venda> findByDataVendaBetween(LocalDate inicio, LocalDate fim);

    @EntityGraph(attributePaths = {"animal", "animal.pasto"})
    List<Venda> findTop5ByOrderByDataVendaDescIdDesc();

    boolean existsByAnimalId(Long animalId);

    @Query("SELECT COALESCE(SUM(COALESCE(v.valorVenda, 0)), 0) FROM Venda v")
    BigDecimal somarGanhoTotal();
}
