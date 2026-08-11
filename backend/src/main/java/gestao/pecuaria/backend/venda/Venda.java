package gestao.pecuaria.backend.venda;

import gestao.pecuaria.backend.lote.Lote;
import gestao.pecuaria.backend.pagamento.entity.PagamentoVenda;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "venda")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id", nullable = false, unique = true)
    private Lote lote;

    @Column(name = "nome_comprador", nullable = false)
    private String nomeComprador;

    @Column(name = "valor_total", nullable = false)
    private BigDecimal valorTotal;

    @Column(name = "data_venda", nullable = false)
    private LocalDate dataVenda;

    @Column(name = "peso_kg_venda", nullable = false)
    private BigDecimal pesoKgVenda;

    @Column(name = "criado_em", insertable = false, updatable = false)
    private LocalDateTime criadoEm;

    @OneToMany(mappedBy = "venda")
    private List<PagamentoVenda> pagamentos = new ArrayList<>();
}
