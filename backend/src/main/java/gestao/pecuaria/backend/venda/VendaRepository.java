package gestao.pecuaria.backend.venda;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    Optional<Venda> findByAnimalId(Long animalId);

    List<Venda> findByDataVendaBetween(LocalDate inicio, LocalDate fim);

    boolean existsByAnimalId(Long animalId);

    @Query("SELECT COALESCE(SUM(COALESCE(v.valorVenda, 0)), 0) FROM Venda v")
    BigDecimal somarGanhoTotal();
}
