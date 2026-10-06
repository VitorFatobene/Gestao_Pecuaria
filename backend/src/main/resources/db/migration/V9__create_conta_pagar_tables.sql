CREATE TABLE conta_pagar (
    id BIGSERIAL PRIMARY KEY,
    descricao VARCHAR(200) NOT NULL,
    categoria VARCHAR(30) NOT NULL,
    fornecedor VARCHAR(200) NOT NULL,
    valor_total NUMERIC(12,2) NOT NULL,
    data_compra DATE NOT NULL,
    tipo_pagamento VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    observacao VARCHAR(1000),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_conta_pagar_valor_total_positivo CHECK (valor_total > 0)
);

CREATE TABLE parcela_conta_pagar (
    id BIGSERIAL PRIMARY KEY,
    conta_pagar_id BIGINT NOT NULL,
    numero_parcela INTEGER NOT NULL,
    valor NUMERIC(12,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(30) NOT NULL,
    forma_pagamento VARCHAR(30),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_parcela_conta_pagar_conta
        FOREIGN KEY (conta_pagar_id)
        REFERENCES conta_pagar(id)
        ON DELETE RESTRICT,
    CONSTRAINT uk_parcela_conta_pagar_numero
        UNIQUE (conta_pagar_id, numero_parcela),
    CONSTRAINT ck_parcela_conta_pagar_numero_positivo CHECK (numero_parcela >= 1),
    CONSTRAINT ck_parcela_conta_pagar_valor_positivo CHECK (valor > 0)
);

CREATE INDEX idx_conta_pagar_status ON conta_pagar(status);
CREATE INDEX idx_conta_pagar_categoria ON conta_pagar(categoria);
CREATE INDEX idx_parcela_conta_pagar_vencimento ON parcela_conta_pagar(data_vencimento);
CREATE INDEX idx_parcela_conta_pagar_status ON parcela_conta_pagar(status);
CREATE INDEX idx_parcela_conta_pagar_conta ON parcela_conta_pagar(conta_pagar_id);
