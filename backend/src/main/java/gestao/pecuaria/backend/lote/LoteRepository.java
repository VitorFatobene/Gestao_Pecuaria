package gestao.pecuaria.backend.lote;

import gestao.pecuaria.backend.lote.enums.StatusLote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    List<Lote> findByStatus(StatusLote status);
}
