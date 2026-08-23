package gestao.pecuaria.backend.pesagem;

import gestao.pecuaria.backend.animal.Animal;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Table(name = "pesagem_animal")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PesagemAnimal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(name = "peso_kg", nullable = false)
    private BigDecimal pesoKg;

    @Column(name = "data_pesagem", nullable = false)
    private LocalDate dataPesagem;

    @Column(length = 500)
    private String observacao;

    @Column(name = "criado_em", insertable = false, updatable = false)
    private LocalDateTime criadoEm;
}
