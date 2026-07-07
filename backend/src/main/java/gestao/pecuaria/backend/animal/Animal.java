package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.animal.dto.AnimalRequestDTO;
import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import gestao.pecuaria.backend.pasto.Pasto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Table(name = "animal")
@Entity(name = "Animal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long codigoAnimal;
    private String raca;
    private BigDecimal pesoKg;
    private BigDecimal valorPago;
    private BigDecimal valorFrete;
    private String nomeVendedor;
    private LocalDate dataCompra;
    private String imagemUrl;

    @Enumerated(EnumType.STRING)
    private StatusAnimal status;

    @ManyToOne
    private Pasto pasto;

    @Column(name = "criado_em", insertable = false, updatable = false)
    private LocalDateTime criadoEm;

    public Animal (AnimalRequestDTO animal){
        this.codigoAnimal = animal.codigoAnimal();
        this.raca = animal.raca();
        this.pesoKg = animal.pesoKg();
        this.valorPago = animal.valorPago();
        this.valorFrete = animal.valorFrete();
        this.nomeVendedor = animal.nomeVendedor();
        this.dataCompra = animal.dataCompra();
        this.imagemUrl = animal.imagemUrl();
    }
}
