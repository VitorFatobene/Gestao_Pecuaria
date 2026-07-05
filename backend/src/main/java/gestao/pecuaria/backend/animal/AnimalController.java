package gestao.pecuaria.backend.animal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/animais")
public class AnimalController {

    @GetMapping
    public void teste(){
        System.out.println("teste");
    }
}
