import { fetchPlayers, fetchTeams, fetchGames, fetchPlayerStats } from './api.js'
import {
  loadCart,
  saveCart,
  addToCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
} from './cart.js'

const ROUTES = [
  { key: 'home', label: 'Início' },
  { key: 'products', label: 'Produtos' },
  { key: 'players', label: 'Jogadores' },
  { key: 'teams', label: 'Equipas' },
  { key: 'cart', label: 'Carrinho' },
  { key: 'about', label: 'Sobre' },
]

const DEFAULT_ROUTE = 'home'

const STORE_PRODUCTS = [
  { id: 'prod-1', name: 'Camisola Lakers – LeBron #23', team: 'Los Angeles Lakers', category: 'Camisola', price: 89.99, image: './imagens/Camisola Lakers – LeBron #23.jpg' },
  { id: 'prod-2', name: 'Camisola Warriors – Curry #30', team: 'Golden State Warriors', category: 'Camisola', price: 89.99, image: './imagens/Camisola Warriors – Curry #30.webp' },
  { id: 'prod-3', name: 'Camisola Bulls – Jordan #23', team: 'Chicago Bulls', category: 'Camisola', price: 94.99, image: './imagens/Camisola Bulls – Jordan #23.webp' },
  { id: 'prod-4', name: 'Camisola Celtics – Tatum #0', team: 'Boston Celtics', category: 'Camisola', price: 84.99, image: './imagens/Camisola Celtics – Tatum #0.jpg' },
  { id: 'prod-5', name: 'Bola NBA Official Game Ball', team: 'NBA', category: 'Bola', price: 149.99, image: './imagens/Bola NBA Official Game Ball.jpg' },
  { id: 'prod-6', name: 'Bola de Treino NBA', team: 'NBA', category: 'Bola', price: 49.99, image: './imagens/Bola de Treino NBA.webp' },
  { id: 'prod-7', name: 'Boné NBA – Lakers Edition', team: 'Los Angeles Lakers', category: 'Acessório', price: 34.99, image: './imagens/Boné NBA – Lakers Edition.webp' },
  { id: 'prod-8', name: 'Mochila NBA – Warriors', team: 'Golden State Warriors', category: 'Acessório', price: 59.99, image: './imagens/Mochila NBA – Warriors.webp' },
]

const PRODUCT_CATEGORIES = ['Todos', ...new Set(STORE_PRODUCTS.map((product) => product.category))]

const appState = {
  route: getCurrentRoute(),
  teams: [],
  players: [],
  playerFilters: { query: '', team: 'all' },
  teamSearch: '',
  games: [],
  productCategory: 'Todos',
  productSearch: '',
  cart: loadCart(),
  playerStats: null,
  loadingGames: false,
  loadingStats: false,
  loading: { players: false, teams: false },
  errors: { players: '', teams: '' },
  errorGames: '',
  errorStats: '',
}

const root = document.getElementById('root')

function createElement(tag, props = {}, ...children) {
  const element = document.createElement(tag)
  if (props == null) {
    props = {}
  }

  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value
      return
    }

    if (key === 'text') {
      element.textContent = value
      return
    }

    if (key === 'html') {
      element.innerHTML = value
      return
    }

    if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value)
      return
    }

    element.setAttribute(key, value)
  })

  children.flat().forEach((child) => {
    if (child === null || child === undefined || typeof child === 'boolean') {
      return
    }
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(child))
      return
    }
    element.appendChild(child)
  })

  return element
}

function getCurrentRoute() {
  const route = window.location.hash.replace('#', '')
  return route || DEFAULT_ROUTE
}

function setRoute(route) {
  window.location.hash = `#${route}`
}

function formatCurrency(value) {
  return `€${value.toFixed(2)}`
}

function getFilteredProducts() {
  return STORE_PRODUCTS.filter((product) => {
    const matchesCategory = appState.productCategory === 'Todos' || product.category === appState.productCategory
    const query = appState.productSearch.toLowerCase()
    const matchesSearch = product.name.toLowerCase().includes(query) || product.team.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })
}

function getFilteredTeams() {
  const query = appState.teamSearch.toLowerCase()
  return appState.teams.filter((team) => team.full_name.toLowerCase().includes(query))
}

function getCartTotals() {
  const itemCount = appState.cart.reduce((sum, item) => sum + item.quantity, 0)
  const total = appState.cart.reduce((sum, item) => sum + item.quantity * item.price, 0)
  return { itemCount, total }
}

function render() {
  root.innerHTML = ''
  const wrapper = createElement('div', { className: 'app-wrapper' }, renderHeader(), renderMain())
  root.appendChild(wrapper)
}

function renderHeader() {
  const navLinks = ROUTES.map((routeInfo) => {
    const routeKey = routeInfo.key
    const isActive = routeKey === appState.route
    const link = createElement(
      'a',
      {
        href: `#${routeKey}`,
        className: isActive ? 'active' : '',
      },
      routeInfo.label,
    )

    if (routeKey === 'cart') {
      const { itemCount } = getCartTotals()
      if (itemCount > 0) {
        link.appendChild(createElement('span', { className: 'badge', text: itemCount }))
      }
    }

    return link
  })

  return createElement(
    'header',
    { className: 'topbar' },
    createElement(
      'div',
      { className: 'brand' },
      createElement('a', { href: '#home' },
        createElement('img', { src: './imagens/logo.png', alt: 'Basket Store logo', className: 'brand-logo' }),
        createElement('div', null,
          createElement('h1', { text: 'Basket Store' }),
          createElement('p', { text: 'NBA real, experiência nova.' }),
        ),
      ),
    ),
    createElement('nav', null, navLinks),
  )
}

function renderMain() {
  return createElement('main', { className: 'main-content' }, renderPage())
}

function renderPage() {
  if (!ROUTES.some((item) => item.key === appState.route)) {
    appState.route = DEFAULT_ROUTE
  }

  switch (appState.route) {
    case 'home':
      return renderHomePage()
    case 'products':
      return renderProductsPage()
    case 'players':
      return renderPlayersPage()
    case 'teams':
      return renderTeamsPage()
    case 'cart':
      return renderCartPage()
    case 'about':
      return renderAboutPage()
    default:
      return renderHomePage()
  }
}

function renderHomePage() {
  const highlights = STORE_PRODUCTS.slice(0, 4).map(renderProductCard)

  return createElement(
    'div',
    null,
    createElement(
      'section',
      { className: 'hero' },
      createElement(
        'div',
        { className: 'hero-copy' },
        createElement('span', { className: 'eyebrow', text: 'BALLOUT' }),
        createElement('h1', null, 'NBA Store Reloaded'),
        createElement(
          'p',
          null,
          'Loja de basketball com dados reais da API ',
          createElement('strong', { text: 'balldontlie.io' }),
          '.',
        ),
        createElement(
          'div',
          { className: 'hero-actions' },
          createElement('a', { className: 'hero-button', href: '#products', text: 'Ver produtos' }),
          createElement('a', { className: 'hero-link', href: '#players', text: 'Ver jogadores' }),
        ),
      ),
      createElement(
        'div',
        { className: 'hero-visual' },
        createElement('div', { className: 'hero-card' },
          createElement('h2', { text: 'O que encontras aqui' }),
          createElement('p', { text: 'Camisolas, bolas e acessórios oficiais, mais informação real sobre jogadores e equipas NBA.' }),
          createElement(
            'div',
            { className: 'hero-tags' },
            createElement('span', { text: '🏀 Produtos oficiais' }),
            createElement('span', { text: '👟 Jogadores reais' }),
            createElement('span', { text: '🏆 Equipas NBA' }),
          ),
        ),
      ),
    ),
    createElement(
      'section',
      { className: 'section-block' },
      createElement(
        'div',
        { className: 'section-heading' },
        createElement(
          'div',
          null,
          createElement('h2', { text: 'Produtos em destaque' }),
          createElement('p', { text: 'Os artigos mais populares da loja.' }),
        ),
        createElement('a', { className: 'view-all-link', href: '#products', text: 'Ver todos →' }),
      ),
      createElement('div', { className: 'cards-grid' }, highlights),
    ),
    createElement(
      'section',
      { className: 'section-block' },
      createElement(
        'div',
        { className: 'section-heading' },
        createElement(
          'div',
          null,
          createElement('h2', { text: 'Jogos NBA recentes' }),
          createElement('p', { text: 'Últimos jogos carregados da API balldontlie.' }),
        ),
        appState.loadingGames && createElement('span', { className: 'empty', text: 'A carregar jogos...' }),
      ),
      appState.errorGames && createElement('p', { className: 'empty', text: appState.errorGames }),
      createElement('div', { className: 'cards-grid' }, appState.games.map(renderGameCard)),
    ),
  )
}

function renderProductsPage() {
  const filteredProducts = getFilteredProducts()

  return createElement(
    'div',
    null,
    renderFilters(
      createElement('input', {
        id: 'productSearch',
        type: 'text',
        value: appState.productSearch,
        placeholder: 'Camisola, bola, equipa...',
        onInput: (event) => handleProductSearch(event.target.value),
      }),
      createElement('select', {
        id: 'categoryFilter',
        value: appState.productCategory,
        onChange: (event) => handleCategoryChange(event.target.value),
      }, PRODUCT_CATEGORIES.map((category) => createElement('option', { value: category, text: category }))),
    ),
    createElement(
      'section',
      { className: 'section-block' },
      createElement(
        'div',
        { className: 'section-heading' },
        createElement(
          'div',
          null,
          createElement('h2', { text: 'Produtos' }),
          createElement('p', { text: 'Camisolas, bolas e acessórios oficiais NBA.' }),
        ),
        createElement('span', { text: `${filteredProducts.length} artigos` }),
      ),
      filteredProducts.length === 0
        ? createElement('p', { className: 'empty', text: 'Nenhum produto encontrado.' })
        : createElement('div', { className: 'cards-grid' }, filteredProducts.map(renderProductCard)),
    ),
  )
}

function renderPlayersPage() {
  const players = appState.players

  return createElement(
    'div',
    null,
    renderFilters(
      createElement('input', {
        id: 'playerSearch',
        type: 'text',
        value: appState.playerFilters.query,
        placeholder: 'Digite um nome...',
        onInput: (event) => handlePlayerQuery(event.target.value),
      }),
      createElement('select', {
        id: 'teamFilter',
        value: appState.playerFilters.team,
        onChange: (event) => handlePlayerTeam(event.target.value),
      }, [
        createElement('option', { value: 'all', text: 'Todas as equipas' }),
        ...appState.teams.map((team) => createElement('option', { value: team.id, text: team.full_name })),
      ]),
    ),
    createElement(
      'section',
      { className: 'section-block' },
      createElement(
        'div',
        { className: 'section-heading' },
        createElement(
          'div',
          null,
          createElement('h2', { text: 'Jogadores NBA' }),
          createElement('p', { text: 'Dados reais via balldontlie.io.' }),
        ),
        createElement('span', { text: `${players.length} resultados` }),
      ),
      appState.loading.players && createElement('p', { className: 'empty', text: 'A carregar jogadores...' }),
      appState.errors.players && createElement('p', { className: 'empty', text: appState.errors.players }),
      !appState.loading.players && !appState.errors.players && players.length === 0 && createElement('p', { className: 'empty', text: 'Nenhum jogador encontrado.' }),
      players.length > 0 && renderPlayersTable(players),
      renderPlayerStatsArea(),
    ),
  )
}

function renderTeamsPage() {
  const teams = getFilteredTeams()

  return createElement(
    'div',
    null,
    renderFilters(
      createElement('input', {
        id: 'teamSearch',
        type: 'text',
        value: appState.teamSearch,
        placeholder: 'Digite o nome da equipa...',
        onInput: (event) => handleTeamSearch(event.target.value),
      }),
    ),
    createElement(
      'section',
      { className: 'section-block' },
      createElement(
        'div',
        { className: 'section-heading' },
        createElement(
          'div',
          null,
          createElement('h2', { text: 'Equipas NBA' }),
          createElement('p', { text: 'Equipas oficiais retornadas pela API.' }),
        ),
        createElement('span', { text: `${teams.length} equipas` }),
      ),
      appState.loading.teams && createElement('p', { className: 'empty', text: 'A carregar equipas...' }),
      appState.errors.teams && createElement('p', { className: 'empty', text: appState.errors.teams }),
      !appState.loading.teams && !appState.errors.teams && teams.length === 0 && createElement('p', { className: 'empty', text: 'Nenhuma equipa encontrada.' }),
      teams.length > 0 && createElement('div', { className: 'cards-grid team-grid' }, teams.map(renderTeamCard)),
    ),
  )
}

function renderCartPage() {
  const { itemCount, total } = getCartTotals()

  return createElement(
    'section',
    { className: 'section-block' },
    createElement(
      'div',
      { className: 'section-heading' },
      createElement(
        'div',
        null,
        createElement('h2', { text: 'Carrinho' }),
        createElement('p', { text: 'Os seus itens guardados localmente.' }),
      ),
      createElement(
        'button',
        { type: 'button', onClick: handleClearCart, disabled: appState.cart.length === 0 },
        'Esvaziar carrinho',
      ),
    ),
    appState.cart.length === 0
      ? createElement('p', { className: 'empty', text: 'O seu carrinho está vazio.' })
      : createElement(
          'div',
          { className: 'cart-grid' },
          createElement('div', { className: 'cart-items' }, appState.cart.map(renderCartItem)),
          createElement(
            'article',
            { className: 'checkout-card' },
            createElement('h3', { text: 'Resumo' }),
            createElement('p', { text: `Total de itens: ${itemCount}` }),
            createElement('p', { className: 'price', text: `Total: ${formatCurrency(total)}` }),
            createElement('button', { type: 'button', onClick: handleCheckout }, 'Finalizar compra'),
          ),
        ),
  )
}

function renderAboutPage() {
  return createElement(
    'section',
    { className: 'section-block about-card' },
    createElement('h2', { text: 'Sobre este projeto' }),
    createElement('p', {
      html: 'Este site foi criado com JavaScript puro, consumindo dados reais da API <strong>balldontlie.io</strong> e usando HTML, CSS e DOM.',
    }),
    createElement(
      'ul',
      null,
      createElement('li', { text: 'Secção de Produtos independente (camisolas, bolas, acessórios)' }),
      createElement('li', { text: 'Secção de Jogadores apenas informativa, sem compra' }),
      createElement('li', { text: 'Secção de Equipas NBA com dados reais' }),
      createElement('li', { text: 'Pesquisa, filtros e carrinho persistido em localStorage' }),
      createElement('li', { text: 'Design responsivo e moderno' }),
    ),
  )
}

function renderFilters(...controls) {
  return createElement('section', { className: 'filters' }, controls)
}

function renderPlayersTable(players) {
  const headerRow = createElement(
    'tr',
    null,
    createElement('th', { text: 'Nome' }),
    createElement('th', { text: 'Posição' }),
    createElement('th', { text: 'Equipa' }),
    createElement('th', { text: 'Conferência' }),
    createElement('th', { text: 'Divisão' }),
    createElement('th', { text: 'Stats' }),
  )

  const bodyRows = players.map((player) =>
    createElement(
      'tr',
      null,
      createElement('td', { className: 'player-name-cell', text: player.name }),
      createElement('td', null, createElement('span', { className: 'pos-badge', text: player.position })),
      createElement('td', { text: player.team }),
      createElement('td', { text: player.conference }),
      createElement('td', { text: player.division }),
      createElement(
        'td',
        null,
        createElement('button', { type: 'button', onClick: () => handlePlayerStats(player.id, player.name) }, 'Mostrar Stats'),
      ),
    ),
  )

  return createElement(
    'div',
    { className: 'players-table-wrap' },
    createElement(
      'table',
      { className: 'players-table' },
      createElement('thead', null, headerRow),
      createElement('tbody', null, bodyRows),
    ),
  )
}

function renderGameCard(game) {
  const home = game.home_team_abbreviation || game.home_team?.abbreviation || 'N/A'
  const visitor = game.visitor_team_abbreviation || game.visitor_team?.abbreviation || 'N/A'
  const status = game.status || 'N/A'
  const date = new Date(game.date).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const score = `${game.home_team_score || 0} - ${game.visitor_team_score || 0}`

  return createElement(
    'article',
    { className: 'product-card' },
    createElement('h3', { text: `${home} vs ${visitor}` }),
    createElement('p', { text: `Resultado: ${score}` }),
    createElement('p', { text: `Data: ${date}` }),
    createElement('p', { text: status }),
  )
}

function renderPlayerStatsArea() {
  if (appState.loadingStats) {
    return createElement('p', { className: 'empty', text: 'A carregar estatísticas...' })
  }

  if (appState.errorStats) {
    return createElement('p', { className: 'empty', text: appState.errorStats })
  }

  if (!appState.playerStats || !appState.playerStats.data || appState.playerStats.data.length === 0) {
    return createElement('p', { className: 'empty', text: 'Clique em "Mostrar Stats" para ver as médias do jogador.' })
  }

  const stats = appState.playerStats.data[0]
  return createElement(
    'article',
    { className: 'section-block' },
    createElement('h3', { text: `Médias ${appState.playerStats.playerName} - ${appState.playerStats.season}` }),
    createElement('div', { className: 'cards-grid' },
      createElement('article', { className: 'product-card' },
        createElement('h4', { text: 'PTS' }),
        createElement('p', { text: stats.pts.toFixed(1) }),
      ),
      createElement('article', { className: 'product-card' },
        createElement('h4', { text: 'REB' }),
        createElement('p', { text: stats.reb.toFixed(1) }),
      ),
      createElement('article', { className: 'product-card' },
        createElement('h4', { text: 'AST' }),
        createElement('p', { text: stats.ast.toFixed(1) }),
      ),
    ),
  )
}

function renderTeamCard(team) {
  return createElement(
    'article',
    { className: 'team-card' },
    createElement('div', { className: 'team-abbr', text: team.abbreviation || 'N/D' }),
    createElement('h3', null, team.full_name),
    createElement('p', null, team.city),
    createElement('p', null, `${team.conference} Conference`),
    createElement('p', null, `${team.division} Division`),
  )
}

function renderCartItem(item) {
  return createElement(
    'article',
    { className: 'cart-item' },
    createElement(
      'div',
      null,
      createElement('h3', { text: item.name }),
      createElement('p', { text: `Quantidade: ${item.quantity}` }),
      createElement('p', { className: 'price', text: formatCurrency(item.price) }),
    ),
    createElement(
      'div',
      { className: 'cart-actions' },
      createElement('button', { type: 'button', onClick: () => handleUpdateQuantity(item.id, -1) }, '−'),
      createElement('span', null, item.quantity),
      createElement('button', { type: 'button', onClick: () => handleUpdateQuantity(item.id, 1) }, '+'),
      createElement('button', { className: 'remove-btn', type: 'button', onClick: () => handleRemoveItem(item.id) }, 'Remover'),
    ),
  )
}

function handleProductSearch(value) {
  appState.productSearch = value
  render()
}

function handleCategoryChange(value) {
  appState.productCategory = value
  render()
}

function handlePlayerQuery(value) {
  appState.playerFilters.query = value
  render()
  loadPlayers()
}

function handlePlayerTeam(value) {
  appState.playerFilters.team = value
  render()
  loadPlayers()
}

function handleTeamSearch(value) {
  appState.teamSearch = value
  render()
}

function handleAddToCart(product) {
  appState.cart = addToCart(appState.cart, product)
  saveCart(appState.cart)
  render()
}

function handleUpdateQuantity(id, change) {
  appState.cart = updateCartQuantity(appState.cart, id, change)
  saveCart(appState.cart)
  render()
}

function handleRemoveItem(id) {
  appState.cart = removeCartItem(appState.cart, id)
  saveCart(appState.cart)
  render()
}

function handleClearCart() {
  appState.cart = clearCart()
  saveCart(appState.cart)
  render()
}

function handleCheckout() {
  appState.cart = clearCart()
  saveCart(appState.cart)
  alert('Compra finalizada! Obrigado pela preferência.')
  render()
}

function renderProductCard(product) {
  return createElement(
    'article',
    { className: 'product-card' },
    createElement('div', { className: 'product-img-wrap' },
      createElement('img', { src: product.image, alt: product.name }),
      createElement('div', { className: 'product-img-caption' },
        createElement('span', { className: 'product-category-badge', text: product.category }),
        createElement('h3', null, product.name),
      ),
    ),
    createElement('div', { className: 'product-copy' },
      createElement('p', { className: 'product-team', text: product.team }),
    ),
    createElement('div', { className: 'product-footer' },
      createElement('span', { className: 'product-price', text: formatCurrency(product.price) }),
      createElement('button', { type: 'button', onClick: () => handleAddToCart(product) }, 'Adicionar'),
    ),
  )
}

async function loadTeams() {
  appState.loading.teams = true
  appState.errors.teams = ''
  render()
  try {
    const data = await fetchTeams()
    appState.teams = data.data
  } catch (error) {
    appState.errors.teams = error.message
  } finally {
    appState.loading.teams = false
    render()
  }
}

async function loadPlayers() {
  appState.loading.players = true
  appState.errors.players = ''
  render()
  try {
    const data = await fetchPlayers({
      search: appState.playerFilters.query,
      team: appState.playerFilters.team,
      perPage: 60,
      page: 1,
    })

    appState.players = data.data.map((player) => ({
      id: player.id,
      name: `${player.first_name} ${player.last_name}`,
      team: player.team.full_name,
      position: player.position || 'N/D',
      conference: player.team.conference || 'N/D',
      division: player.team.division || 'N/D',
    }))
  } catch (error) {
    appState.errors.players = error.message
    appState.players = []
  } finally {
    appState.loading.players = false
    render()
  }
}

async function loadGames() {
  appState.loadingGames = true
  appState.errorGames = ''
  render()
  try {
    const data = await fetchGames({ season: 2024, perPage: 6, page: 1 })
    appState.games = data.data
  } catch (error) {
    appState.errorGames = error.message
    appState.games = []
  } finally {
    appState.loadingGames = false
    render()
  }
}

async function handlePlayerStats(playerId, playerName) {
  appState.loadingStats = true
  appState.errorStats = ''
  render()
  try {
    const data = await fetchPlayerStats({ playerId, season: 2024 })
    appState.playerStats = { data: data.data, playerName, season: 2024 }
  } catch (error) {
    appState.errorStats = error.message
    appState.playerStats = null
  } finally {
    appState.loadingStats = false
    render()
  }
}

function handleRouteChange() {
  appState.route = getCurrentRoute()
  if (!ROUTES.some((item) => item.key === appState.route)) {
    appState.route = DEFAULT_ROUTE
  }
  render()
}

function initializeApp() {
  if (!root) {
    return
  }

  render()
  loadTeams()
  loadPlayers()
  loadGames()
  window.addEventListener('hashchange', handleRouteChange)
}

initializeApp()
