package gestao.pecuaria.backend.pasto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PastoRepository extends JpaRepository<Pasto, Long> {

    long countByAtivoTrue();

    List<Pasto> findByAtivoTrueOrderByNomeAsc();
}
