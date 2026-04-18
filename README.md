# painel_fazendadaluz

Painel web para gestao de gado das Fazendas Da Luz, com foco em estoque animal, manejo sanitario, compra, venda e relatorios gerenciais.

## Fazendas ativas

- Arapey
- Chiquita
- Passa da Guarda
- Colorado
- Sarandi

## O que esta pronto

- controle de estoque por categoria
- botoes para compra, venda, consumo, nascimento e morte
- ajuste manual de estoque e total declarado
- criacao de categorias para mudancas de manejo
- dashboard consolidado do grupo
- registros sanitarios por fazenda
- analise comercial de vendas por kg
- geracao de PDF para gestores com logo e responsavel tecnico
- persistencia local no navegador

## Como abrir localmente

1. Entre na pasta do projeto.
2. Execute `iniciar-painel.bat` ou rode `python -m http.server 4173`.
3. Abra `http://127.0.0.1:4173/`.

## Deploy no Render

Este repositorio agora inclui um arquivo `render.yaml` na raiz com os tres recursos necessarios:

- site estatico para o frontend
- web service Node para a API
- banco Render Postgres para persistencia

### Como publicar

1. Suba este repositorio para o GitHub.
2. No Render, clique em `New > Blueprint`.
3. Conecte o repositorio `painel_fazendadaluz`.
4. Confirme o uso do arquivo `render.yaml` na raiz.
5. Informe os segredos solicitados pelo Render:
   - `JWT_SECRET`
   - `ADMIN_BOOTSTRAP_PASSWORD`
6. Finalize o deploy do Blueprint.

### Observacoes importantes

- O backend usa `DATABASE_URL`, que sera preenchido automaticamente a partir do banco definido no Blueprint.
- O frontend ja esta apontando para `https://painel-pecuario-api.onrender.com`, entao o nome do servico da API no Render precisa continuar `painel-pecuario-api`.
- Se voce ja tiver servicos existentes no Render gerenciados por outro Blueprint, nao sincronize os mesmos recursos com dois Blueprints diferentes.

## Observacao importante

Na fazenda Arapey, as categorias informadas somavam 2.995 animais, mas o total declarado era 3.015. Para preservar o total informado, foi criado um grupo chamado `Ajuste inicial de conferencia` com 20 animais.
