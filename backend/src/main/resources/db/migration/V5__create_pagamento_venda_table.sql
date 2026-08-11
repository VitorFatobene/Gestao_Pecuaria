CREATE TABLE pagamento_venda (
    id BIGSERIAL PRIMARY KEY,
    venda_id BIGINT NOT NULL,
    numero_parcela INTEGER NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(30) NOT NULL,
    forma_pagamento VARCHAR(30),

    CONSTRAINT fk_pagamento_venda_venda
        FOREIGN KEY (venda_id)
        REFERENCES venda(id)
        ON DELETE RESTRICT
);
