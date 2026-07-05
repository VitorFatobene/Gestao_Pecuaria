CREATE TABLE usuario (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pasto (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    area_hectares NUMERIC(10,2),
    descricao VARCHAR(500),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE animal (
    id BIGSERIAL PRIMARY KEY,
    codigo_animal BIGINT NOT NULL UNIQUE,
    raca VARCHAR(100) NOT NULL,
    sexo VARCHAR(20),
    peso_kg NUMERIC(10,2) NOT NULL,
    valor_pago NUMERIC(12,2) NOT NULL,
    valor_frete NUMERIC(12,2) NOT NULL DEFAULT 0,
    nome_vendedor VARCHAR(150),
    data_compra DATE NOT NULL,
    imagem_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'ATIVO',
    pasto_id BIGINT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_animal_pasto
        FOREIGN KEY (pasto_id)
        REFERENCES pasto(id)
        ON DELETE SET NULL
);

CREATE TABLE venda (
    id BIGSERIAL PRIMARY KEY,
    animal_id BIGINT NOT NULL UNIQUE,
    nome_comprador VARCHAR(150) NOT NULL,
    valor_venda NUMERIC(12,2) NOT NULL,
    data_venda DATE NOT NULL,
    peso_kg_venda NUMERIC(10,2) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_venda_animal
        FOREIGN KEY (animal_id)
        REFERENCES animal(id)
        ON DELETE RESTRICT
);
