CREATE TABLE lote (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao VARCHAR(500),
    status VARCHAR(30) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE animal
    ADD COLUMN lote_id BIGINT;

ALTER TABLE animal
    ADD CONSTRAINT fk_animal_lote
        FOREIGN KEY (lote_id)
        REFERENCES lote(id)
        ON DELETE SET NULL;
