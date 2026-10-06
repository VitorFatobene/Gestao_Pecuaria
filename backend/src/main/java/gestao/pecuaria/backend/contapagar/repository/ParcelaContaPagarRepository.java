package gestao.pecuaria.backend.contapagar.repository;

import gestao.pecuaria.backend.contapagar.entity.ParcelaContaPagar;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParcelaContaPagarRepository extends JpaRepository<ParcelaContaPagar, Long> {

    @Override
    @EntityGraph(attributePaths = {"contaPagar", "contaPagar.parcelas"})
    Optional<ParcelaContaPagar> findById(Long id);
}
