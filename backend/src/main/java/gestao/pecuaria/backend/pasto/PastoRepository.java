package gestao.pecuaria.backend.pasto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PastoRepository extends JpaRepository<Pasto, Long> {

    List<Pasto> findAllByUsuarioId(Long usuarioId);

    Optional<Pasto> findByIdAndUsuarioId(Long id, Long usuarioId);

    long countByUsuarioId(Long usuarioId);

    long countByAtivoTrueAndUsuarioId(Long usuarioId);

    List<Pasto> findByAtivoTrueAndUsuarioIdOrderByNomeAsc(Long usuarioId);
}
