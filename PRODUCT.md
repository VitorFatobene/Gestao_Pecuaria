# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

O usuario principal e o pecuarista, dono ou gestor da fazenda, usando o sistema para acompanhar e operar a gestao do rebanho e da propriedade.

O uso deve funcionar bem no escritorio e no campo. O mobile web e um contexto central, porque o principal usuario acessara o produto pela web em celular.

## Product Purpose

Gestao Pecuaria e um sistema web para controle operacional, financeiro e de manejo de uma propriedade pecuaria.

O produto centraliza informacoes de animais, pastos, movimentacoes, lotes, vendas, pagamentos, pesagens e indicadores para apoiar decisoes praticas do pecuarista no dia a dia.

Sucesso significa permitir que o usuario encontre, registre e acompanhe informacoes do rebanho com rapidez, clareza e confianca, tanto em rotinas operacionais quanto em acompanhamento financeiro e de manejo.

## Positioning

O foco do produto e combinar controle operacional, gestao financeira e manejo de pastagens em uma experiencia pratica para o pecuarista.

O diferencial a preservar em futuras decisoes de produto e interface e a usabilidade aplicada ao trabalho real: cadastro, consulta, movimentacao, venda, acompanhamento financeiro e leitura de indicadores precisam ser diretos, claros e uteis em situacoes de uso recorrente.

## Operating Context

O sistema opera no contexto de fazendas pecuarias brasileiras.

Fluxos confirmados no codigo:

- autenticacao e cadastro de usuario;
- registro de dados do usuario e propriedade rural, incluindo cidade, estado e nome da propriedade;
- cadastro e consulta de animais;
- acompanhamento de detalhes do animal, localizacao, movimentacoes e pesagens;
- cadastro e acompanhamento de pastos;
- movimentacao de animais entre pastos;
- organizacao de animais em lotes;
- vendas individuais ou por lote;
- parcelas e pagamentos de vendas;
- dashboard com resumo da fazenda, indicadores financeiros, atividades recentes, manejo de pastagens, rotacao e permanencia;
- area financeira com resumos, indicadores e graficos.

O produto usa portugues do Brasil como idioma de interface e dominio.

## Capabilities and Constraints

Stack confirmada pelo projeto:

- frontend web em React, TypeScript e Vite;
- rotas com React Router;
- graficos com Recharts;
- icones com lucide-react;
- backend em Java 21 com Spring Boot;
- persistencia com PostgreSQL, JPA e Flyway;
- autenticacao com JWT;
- Redis configurado para suporte a integracoes/cache;
- integracao configurada com AgroDoc para cotacao de boi, com UF padrao PR.

Entidades e termos confirmados:

- usuario;
- propriedade rural;
- animal;
- codigo do animal;
- raca;
- sexo;
- peso em kg;
- valor pago;
- frete;
- vendedor;
- data de compra;
- status do animal;
- pasto;
- area em hectares;
- movimentacao animal;
- lote;
- venda;
- comprador;
- valor total;
- pagamento;
- parcela;
- vencimento;
- data de pagamento;
- forma e status de pagamento;
- pesagem.

Restricoes obrigatorias:

- valores monetarios devem usar moeda brasileira, BRL;
- datas, numeros e linguagem devem seguir expectativas de usuarios brasileiros;
- nao inventar metricas, provas, valores, clientes, benchmarks ou conteudo quando os dados reais ou endpoints nao existirem;
- a experiencia deve ser boa em mobile e desktop, com prioridade real para mobile web;
- futuras melhorias de frontend devem preservar a praticidade operacional do usuario.

## Brand Commitments

Nome de produto atualmente usado na interface: Gestao Pecuaria.

Texto secundario atual de marca: Controle agro.

Nao ha, neste momento, evidencia de logotipo final, paleta formal, tipografia oficial ou guia visual aprovado. Futuras decisoes visuais devem tratar o visual existente como implementacao atual, nao como marca definitiva, a menos que seja confirmado pelo usuario.

## Evidence on Hand

Evidencias reais no repositorio:

- `frontend/src/routes/AppRoutes.tsx`: rotas privadas e publicas da aplicacao;
- `frontend/src/layouts/Sidebar.tsx`: navegacao principal e nome atual do produto;
- `frontend/src/features/dashboard/DashboardPage.tsx`: dashboard com resumo, financeiro, manejo e acoes rapidas;
- `backend/src/main/resources/db/migration/`: schema persistido para usuarios, pastos, animais, lotes, vendas, pagamentos, movimentacoes e pesagens;
- `backend/src/main/java/gestao/pecuaria/backend/config/DataSeeder.java`: dados demonstrativos de pastos e animais;
- `backend/src/main/resources/application.properties`: configuracoes de banco, JWT, CORS, Redis e AgroDoc;
- `frontend/package.json`: stack e scripts do frontend;
- `backend/pom.xml`: stack e dependencias do backend.

Ausencias importantes:

- nao ha README de produto preenchido na raiz;
- nao ha DESIGN.md;
- nao ha assets finais de marca alem de favicons/icones publicos basicos;
- nao ha evidencia confirmada de clientes, depoimentos, metas comerciais, precificacao ou claims publicos.

## Product Principles

1. Priorizar a acao pratica do pecuarista: cada tela deve ajudar a cadastrar, encontrar, comparar ou decidir sem atrito desnecessario.
2. Tratar dados reais como autoridade: quando uma informacao nao estiver disponivel, a interface deve deixar isso claro em vez de fabricar precisao.
3. Fazer o financeiro e o manejo conversarem: custos, vendas, pagamentos, peso, pasto, permanencia e lotes devem apoiar uma visao unica da operacao.
4. Projetar para uso recorrente em mobile web: fluxos centrais precisam ser legiveis, tocaveis e eficientes em telas pequenas.
5. Usar linguagem brasileira do agro com clareza, sem exagerar jargoes ou criar termos que o usuario nao reconheca.

## Accessibility & Inclusion

A interface deve funcionar bem em mobile e desktop, com controles legiveis e acionaveis por toque.

Nao ha, neste momento, um padrao formal de acessibilidade confirmado alem dessa necessidade pratica. Futuras decisoes devem evitar dependencia exclusiva de cor, manter contraste adequado e preservar labels claros em formularios e acoes.
