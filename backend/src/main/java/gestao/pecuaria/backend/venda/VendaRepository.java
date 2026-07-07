package gestao.pecuaria.backend.venda;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    Optional<Venda> findByAnimalId(Long animalId);

    List<Venda> findByDataVendaBetween(LocalDate inicio, LocalDate fim);

    boolean existsByAnimalId(Long animalId);
}
