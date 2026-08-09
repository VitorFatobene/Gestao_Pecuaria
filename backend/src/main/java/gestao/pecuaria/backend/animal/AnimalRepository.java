package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {

    List<Animal> findByPastoIdAndStatus(Long pastoId, StatusAnimal status);

    List<Animal> findByDataCompraBetweenAndStatus(LocalDate inicio, LocalDate fim, StatusAnimal status);

    List<Animal> findByDataCompraBetween(LocalDate inicio, LocalDate fim);

    long countByStatus(StatusAnimal status);

    @EntityGraph(attributePaths = "pasto")
    List<Animal> findTop5ByStatusOrderByIdDesc(StatusAnimal status);

    List<Animal> findTop5ByOrderByIdDesc();

    @Query("SELECT COALESCE(SUM(COALESCE(a.valorPago, 0) + COALESCE(a.valorFrete, 0)), 0) FROM Animal a")
    BigDecimal somarTotalGasto();
}
