package gestao.pecuaria.backend.usuario.dto;

public record LoginResponseDTO(
        String token,
        String tipo,
        Long usuarioId,
        String nome,
        String email
) {
}
