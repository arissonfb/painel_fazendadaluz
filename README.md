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

O projeto ja inclui um arquivo `render.yaml` pronto para publicar como site estatico no Render.

## Observacao importante

Na fazenda Arapey, as categorias informadas somavam 2.995 animais, mas o total declarado era 3.015. Para preservar o total informado, foi criado um grupo chamado `Ajuste inicial de conferencia` com 20 animais.
