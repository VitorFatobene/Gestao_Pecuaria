ALTER TABLE venda
    DROP COLUMN IF EXISTS animal_id;

ALTER TABLE venda
    RENAME COLUMN valor_venda TO valor_total;

ALTER TABLE venda
    ADD COLUMN lote_id BIGINT;

ALTER TABLE venda
    ADD CONSTRAINT uk_venda_lote UNIQUE (lote_id);

ALTER TABLE venda
    ADD CONSTRAINT fk_venda_lote
        FOREIGN KEY (lote_id)
        REFERENCES lote(id)
        ON DELETE RESTRICT;
