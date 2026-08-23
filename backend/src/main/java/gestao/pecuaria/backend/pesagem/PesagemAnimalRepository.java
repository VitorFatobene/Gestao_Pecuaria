package gestao.pecuaria.backend.pesagem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PesagemAnimalRepository extends JpaRepository<PesagemAnimal, Long> {

    List<PesagemAnimal> findByAnimalIdOrderByDataPesagemDescIdDesc(Long animalId);
}
