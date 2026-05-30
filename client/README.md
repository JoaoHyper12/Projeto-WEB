# Basket Store

Este projeto é uma aplicação web JavaScript pura (sem React/JSX) que consome dados reais da API <https://balldontlie.io> e apresenta uma loja NBA interativa com várias vistas.

## Estrutura

- `index.html` — página principal
- `src/app.js` — lógica de navegação, DOM e interação
- `src/api.js` — consumo da API externa
- `src/cart.js` — gestão de carrinho e localStorage
- `src/styles.css` — estilos do site
- `server.js` — servidor estático local leve

## Como executar

1. Abra o terminal em `client`
2. Instale dependências (se ainda não tiver feito):

```powershell
npm install
```

3. Inicie o servidor:

```powershell
npm start
```

4. Abra no navegador:

```text
http://localhost:3000
```

## Funcionalidades

- Navegação entre 6 vistas
- Consumo de API externa para jogadores e equipas
- Pesquisa e filtros em tempo real
- Carrinho com persistência em `localStorage`
- Criação dinâmica de conteúdo via DOM

## Limpeza realizada

- Removido React/JSX e Vite do projeto
- Mantido apenas HTML, CSS, JavaScript e servidor Node simples
- Simplificado `package.json` para `npm start`
