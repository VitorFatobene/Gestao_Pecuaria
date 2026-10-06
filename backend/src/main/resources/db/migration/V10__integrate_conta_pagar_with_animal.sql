ALTER TABLE conta_pagar
    ADD COLUMN origem VARCHAR(30);

UPDATE conta_pagar
SET origem = 'MANUAL'
WHERE origem IS NULL;

ALTER TABLE conta_pagar
    ALTER COLUMN origem SET NOT NULL;

ALTER TABLE conta_pagar
    ADD COLUMN animal_id BIGINT;

ALTER TABLE conta_pagar
    ADD CONSTRAINT fk_conta_pagar_animal
        FOREIGN KEY (animal_id)
        REFERENCES animal(id)
        ON DELETE RESTRICT;

CREATE INDEX idx_conta_pagar_origem ON conta_pagar(origem);
CREATE INDEX idx_conta_pagar_animal ON conta_pagar(animal_id);
