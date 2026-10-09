package gestao.pecuaria.backend.contapagar.repository;

import gestao.pecuaria.backend.contapagar.entity.ParcelaContaPagar;
import gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

public interface ParcelaContaPagarRepository extends JpaRepository<ParcelaContaPagar, Long> {

    @Override
    @EntityGraph(attributePaths = {"contaPagar", "contaPagar.parcelas"})
    Optional<ParcelaContaPagar> findById(Long id);

    @Query("""
            select coalesce(sum(p.valor), 0)
            from ParcelaContaPagar p
            where p.status = :status
              and p.contaPagar.usuario.id = :usuarioId
            """)
    BigDecimal somarPorStatusAndUsuarioId(
            @Param("status") StatusParcelaContaPagar status,
            @Param("usuarioId") Long usuarioId
    );

    @Query("""
            select coalesce(sum(p.valor), 0)
            from ParcelaContaPagar p
            where p.contaPagar.status <> gestao.pecuaria.backend.contapagar.enums.StatusContaPagar.CANCELADA
              and p.contaPagar.usuario.id = :usuarioId
              and p.status not in (
                  gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar.PAGA,
                  gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar.CANCELADA
              )
            """)
    BigDecimal somarAPagarPorUsuario(@Param("usuarioId") Long usuarioId);

    @Query("""
            select coalesce(sum(p.valor), 0)
            from ParcelaContaPagar p
            where p.contaPagar.status <> gestao.pecuaria.backend.contapagar.enums.StatusContaPagar.CANCELADA
              and p.contaPagar.usuario.id = :usuarioId
              and p.status not in (
                  gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar.PAGA,
                  gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar.CANCELADA
              )
              and p.dataVencimento < :hoje
            """)
    BigDecimal somarVencidasPorUsuario(@Param("hoje") LocalDate hoje, @Param("usuarioId") Long usuarioId);
}
