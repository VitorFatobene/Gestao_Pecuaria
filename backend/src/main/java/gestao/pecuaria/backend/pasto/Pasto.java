package gestao.pecuaria.backend.pasto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private LocalDateTime criadoEm;

}
