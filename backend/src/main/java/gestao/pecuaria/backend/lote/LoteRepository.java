package gestao.pecuaria.backend.lote;

import gestao.pecuaria.backend.lote.enums.StatusLote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    List<Lote> findAllByUsuarioId(Long usuarioId);

    Optional<Lote> findByIdAndUsuarioId(Long id, Long usuarioId);

    List<Lote> findByStatusAndUsuarioId(StatusLote status, Long usuarioId);
}
