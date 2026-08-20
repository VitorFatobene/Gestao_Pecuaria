CREATE TABLE movimentacao_animal (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL,
    pasto_id BIGINT NOT NULL,
    data_entrada DATE NOT NULL,
    data_saida DATE,
    observacao VARCHAR(255),

    CONSTRAINT fk_movimentacao_animal_animal
        FOREIGN KEY (animal_id)
        REFERENCES animal(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_movimentacao_animal_pasto
        FOREIGN KEY (pasto_id)
        REFERENCES pasto(id)
        ON DELETE RESTRICT
);
