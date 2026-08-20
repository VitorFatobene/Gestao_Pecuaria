package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.animal.enums.SexoAnimal;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.lote.Lote;
import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import gestao.pecuaria.backend.pasto.Pasto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Table(name = "animal")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_animal", nullable = false, unique = true)
    private Long codigoAnimal;

    @Column(nullable = false)
    private String raca;

    @Enumerated(EnumType.STRING)
    private SexoAnimal sexo;

    @Column(name = "peso_kg", nullable = false)
    private BigDecimal pesoKg;

    @Column(name = "valor_pago", nullable = false)
    private BigDecimal valorPago;

    @Column(name = "valor_frete", nullable = false)
    private BigDecimal valorFrete;

    @Column(name = "nome_vendedor")
    private String nomeVendedor;

    @Column(name = "data_compra", nullable = false)
    private LocalDate dataCompra;

    @Column(name = "imagem_url")
    private String imagemUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAnimal status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pasto_id")
    private Pasto pasto;

    @OneToMany(mappedBy = "animal")
    private List<MovimentacaoAnimal> movimentacoes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id")
    private Lote lote;

    @Column(name = "criado_em", insertable = false, updatable = false)
    private LocalDateTime criadoEm;
}
