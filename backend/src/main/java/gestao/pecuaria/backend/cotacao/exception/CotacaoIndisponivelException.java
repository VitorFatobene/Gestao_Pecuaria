package gestao.pecuaria.backend.cotacao.exception;

public class CotacaoIndisponivelException extends RuntimeException {

    public CotacaoIndisponivelException(String message) {
        super(message);
    }

    public CotacaoIndisponivelException(String message, Throwable cause) {
        super(message, cause);
    }
}
