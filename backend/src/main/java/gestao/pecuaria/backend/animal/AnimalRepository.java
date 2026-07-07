package gestao.pecuaria.backend.animal;

import gestao.pecuaria.backend.animal.enums.StatusAnimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {

    List<Animal> findByPastoIdAndStatus(Long pastoId, StatusAnimal status);

    List<Animal> findByDataCompraBetweenAndStatus(LocalDate inicio, LocalDate fim, StatusAnimal status);
}
