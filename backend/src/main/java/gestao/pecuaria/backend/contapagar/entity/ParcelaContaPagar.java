package gestao.pecuaria.backend.contapagar.entity;

import gestao.pecuaria.backend.contapagar.enums.StatusParcelaContaPagar;
import gestao.pecuaria.backend.pagamento.enums.FormaPagamento;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "parcela_conta_pagar", uniqueConstraints = @UniqueConstraint(
        name = "uk_parcela_conta_pagar_numero", columnNames = {"conta_pagar_id", "numero_parcela"}
))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParcelaContaPagar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conta_pagar_id", nullable = false)
    private ContaPagar contaPagar;

    @Column(name = "numero_parcela", nullable = false)
    private Integer numeroParcela;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_vencimento", nullable = false)
    private LocalDate dataVencimento;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusParcelaContaPagar status;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", length = 30)
    private FormaPagamento formaPagamento;

    @Column(name = "criado_em", insertable = false, updatable = false)
    private LocalDateTime criadoEm;
}
