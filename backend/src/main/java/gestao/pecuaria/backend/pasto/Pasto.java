package gestao.pecuaria.backend.pasto;

import gestao.pecuaria.backend.movimentacao.entity.MovimentacaoAnimal;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Table(name = "pasto")
@Entity(name = "Pasto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private BigDecimal areaHectares;
    private String descricao;
    private Boolean ativo;

    @Column(name = "criado_em", insertable = false, updatable = false)
    private LocalDateTime criadoEm;

    @OneToMany(mappedBy = "pasto")
    private List<MovimentacaoAnimal> movimentacoes;

}
