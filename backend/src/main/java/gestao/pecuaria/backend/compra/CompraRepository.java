package gestao.pecuaria.backend.compra;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    List<Compra> findAllByUsuarioIdOrderByDataCompraDescIdDesc(Long usuarioId);

    Optional<Compra> findByIdAndUsuarioId(Long id, Long usuarioId);
}
