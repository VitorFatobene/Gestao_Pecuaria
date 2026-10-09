ALTER TABLE animal
    ADD COLUMN usuario_id BIGINT;

ALTER TABLE pasto
    ADD COLUMN usuario_id BIGINT;

ALTER TABLE lote
    ADD COLUMN usuario_id BIGINT;

ALTER TABLE venda
    ADD COLUMN usuario_id BIGINT;

ALTER TABLE conta_pagar
    ADD COLUMN usuario_id BIGINT;

ALTER TABLE animal
    ADD CONSTRAINT fk_animal_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE RESTRICT;

ALTER TABLE pasto
    ADD CONSTRAINT fk_pasto_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE RESTRICT;

ALTER TABLE lote
    ADD CONSTRAINT fk_lote_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE RESTRICT;

ALTER TABLE venda
    ADD CONSTRAINT fk_venda_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE RESTRICT;

ALTER TABLE conta_pagar
    ADD CONSTRAINT fk_conta_pagar_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE RESTRICT;

CREATE INDEX idx_animal_usuario ON animal(usuario_id);
CREATE INDEX idx_pasto_usuario ON pasto(usuario_id);
CREATE INDEX idx_lote_usuario ON lote(usuario_id);
CREATE INDEX idx_venda_usuario ON venda(usuario_id);
CREATE INDEX idx_conta_pagar_usuario ON conta_pagar(usuario_id);

CREATE INDEX idx_animal_usuario_status ON animal(usuario_id, status);
CREATE INDEX idx_animal_usuario_data_compra ON animal(usuario_id, data_compra);
CREATE INDEX idx_venda_usuario_data_venda ON venda(usuario_id, data_venda);
CREATE INDEX idx_conta_pagar_usuario_status ON conta_pagar(usuario_id, status);
