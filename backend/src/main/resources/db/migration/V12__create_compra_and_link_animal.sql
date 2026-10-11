CREATE TABLE compra (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    fornecedor VARCHAR(200) NOT NULL,
    data_compra DATE NOT NULL,
    valor_total NUMERIC(12,2) NOT NULL,
    observacao VARCHAR(1000),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_compra_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE RESTRICT,
    CONSTRAINT ck_compra_valor_total_positivo CHECK (valor_total > 0)
);

ALTER TABLE animal
    ADD COLUMN compra_id BIGINT;

ALTER TABLE animal
    ADD CONSTRAINT fk_animal_compra
        FOREIGN KEY (compra_id)
        REFERENCES compra(id)
        ON DELETE SET NULL;

CREATE INDEX idx_compra_usuario ON compra(usuario_id);
CREATE INDEX idx_compra_usuario_data_compra ON compra(usuario_id, data_compra);
CREATE INDEX idx_animal_compra ON animal(compra_id);
CREATE INDEX idx_animal_usuario_compra ON animal(usuario_id, compra_id);
