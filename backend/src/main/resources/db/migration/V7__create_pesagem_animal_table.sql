CREATE TABLE pesagem_animal (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL,
    peso_kg NUMERIC(10,2) NOT NULL,
    data_pesagem DATE NOT NULL,
    observacao VARCHAR(500),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pesagem_animal_animal
        FOREIGN KEY (animal_id)
        REFERENCES animal(id)
        ON DELETE RESTRICT
);
