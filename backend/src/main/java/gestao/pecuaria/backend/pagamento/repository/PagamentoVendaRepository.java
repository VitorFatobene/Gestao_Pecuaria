package gestao.pecuaria.backend.pagamento.repository;

import gestao.pecuaria.backend.pagamento.entity.PagamentoVenda;
import gestao.pecuaria.backend.pagamento.enums.StatusPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PagamentoVendaRepository extends JpaRepository<PagamentoVenda, Long> {

    List<PagamentoVenda> findByVendaIdOrderByNumeroParcelaAsc(Long vendaId);

    @Query("""
            select coalesce(sum(p.valor), 0)
            from PagamentoVenda p
            where p.status = :status
              and p.venda.usuario.id = :usuarioId
            """)
    BigDecimal somarPorStatusAndUsuarioId(@Param("status") StatusPagamento status, @Param("usuarioId") Long usuarioId);

    @Query("""
            select coalesce(sum(p.valor), 0)
            from PagamentoVenda p
            where p.status not in (
                gestao.pecuaria.backend.pagamento.enums.StatusPagamento.PAGO,
                gestao.pecuaria.backend.pagamento.enums.StatusPagamento.CANCELADO
            )
              and p.venda.usuario.id = :usuarioId
            """)
    BigDecimal somarAReceberPorUsuario(@Param("usuarioId") Long usuarioId);
}
