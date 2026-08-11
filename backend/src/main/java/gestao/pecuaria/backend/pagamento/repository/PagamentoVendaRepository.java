package gestao.pecuaria.backend.pagamento.repository;

import gestao.pecuaria.backend.pagamento.entity.PagamentoVenda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PagamentoVendaRepository extends JpaRepository<PagamentoVenda, Long> {

    List<PagamentoVenda> findByVendaIdOrderByNumeroParcelaAsc(Long vendaId);
}
