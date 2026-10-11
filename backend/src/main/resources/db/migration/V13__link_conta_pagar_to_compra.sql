ALTER TABLE conta_pagar
    ADD COLUMN compra_id BIGINT;

ALTER TABLE conta_pagar
    ADD CONSTRAINT fk_conta_pagar_compra
        FOREIGN KEY (compra_id)
        REFERENCES compra(id)
        ON DELETE RESTRICT;

ALTER TABLE conta_pagar
    ADD CONSTRAINT uk_conta_pagar_compra
        UNIQUE (compra_id);

CREATE INDEX idx_conta_pagar_compra ON conta_pagar(compra_id);
