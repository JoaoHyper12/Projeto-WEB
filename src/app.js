import { fetchPlayers, fetchTeams, fetchGames, fetchPlayerStats } from './api.js'
import { STORE_PRODUCTS, PRODUCT_CATEGORIES } from './products.js'
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
  selectedPlayerId: null,
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
    if (key === 'value' || key === 'checked' || key === 'disabled' || key === 'multiple' || key === 'selected') {
      element[key] = value
      return
    }
    element.setAttribute(key, value)
  })

  children.flat().forEach((child) => {
    if (child === null || child === undefined || typeof child === 'boolean') return
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(child))
      return
    }
    element.appendChild(child)
  })

  return element
}

// Cria um <select> com a opção correta marcada como selected
function createSelect(props, options, currentValue) {
  const select = createElement('select', props)
  options.forEach(({ value, label }) => {
    const option = createElement('option', { value, text: label })
    if (String(value) === String(currentValue)) {
      option.selected = true
    }
    select.appendChild(option)
  })
  return select
}

function getCurrentRoute() {
  const route = window.location.hash.replace('#', '')
  return route || DEFAULT_ROUTE
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
    const isActive = routeKey === appState.route || (routeKey === 'products' && appState.route.startsWith('product/'))
    const link = createElement('a', { href: `#${routeKey}`, className: isActive ? 'active' : '' }, routeInfo.label)
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
  if (appState.route === DEFAULT_ROUTE) {
    return renderHomePage()
  }

  if (appState.route.startsWith('product/')) {
    return renderProductDetailsPage(appState.route.split('/')[1])
  }

  if (!ROUTES.some((item) => item.key === appState.route)) {
    appState.route = DEFAULT_ROUTE
    return renderHomePage()
  }

  switch (appState.route) {
    case 'home':     return renderHomePage()
    case 'products': return renderProductsPage()
    case 'players':  return renderPlayersPage()
    case 'teams':    return renderTeamsPage()
    case 'cart':     return renderCartPage()
    case 'about':    return renderAboutPage()
    default:         return renderHomePage()
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
        createElement('p', null, 'Loja de basketball com dados reais da API ', createElement('strong', { text: 'balldontlie.io' }), '.'),
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
          createElement('div', { className: 'hero-tags' },
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
        createElement('div', null,
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
        createElement('div', null,
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

  // Select de categorias com opção correta selecionada
  const categorySelect = createSelect(
    { id: 'categoryFilter', onChange: (e) => handleCategoryChange(e.target.value) },
    PRODUCT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
    appState.productCategory,
  )

  const searchInput = createElement('input', {
    id: 'productSearch',
    type: 'text',
    placeholder: 'Camisola, bola, equipa...',
    onInput: (e) => handleProductSearch(e.target.value),
  })
  searchInput.value = appState.productSearch

  return createElement(
    'div',
    null,
    renderFilters(searchInput, categorySelect),
    createElement(
      'section',
      { className: 'section-block' },
      createElement(
        'div',
        { className: 'section-heading' },
        createElement('div', null,
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

function getProductById(productId) {
  return STORE_PRODUCTS.find((product) => product.id === productId)
}

function renderProductDetailsPage(productId) {
  const product = getProductById(productId)
  if (!product) {
    return createElement(
      'section',
      { className: 'section-block' },
      createElement('h2', { text: 'Produto não encontrado' }),
      createElement('p', { className: 'empty', text: 'Esse produto não está disponível no momento.' }),
      createElement('a', { className: 'view-all-link', href: '#products', text: 'Voltar aos produtos →' }),
    )
  }

  return createElement(
    'section',
    { className: 'section-block product-detail' },
    createElement(
      'div',
      { className: 'section-heading' },
      createElement(
        'div',
        null,
        createElement('h2', { text: product.name }),
        createElement('p', { text: product.description }),
      ),
      createElement('a', { className: 'view-all-link', href: '#products', text: 'Voltar aos produtos →' }),
    ),
    createElement(
      'div',
      { className: 'product-detail-grid' },
      createElement(
        'div',
        { className: 'product-detail-image' },
        createElement('img', { src: product.image, alt: product.name }),
      ),
      createElement(
        'div',
        { className: 'product-detail-info' },
        createElement(
          'div',
          { className: 'product-detail-meta' },
          createElement('span', { className: 'product-category-badge', text: product.category }),
          createElement('span', { className: 'product-team-tag', text: product.team }),
        ),
        createElement('p', { className: 'product-detail-price', text: formatCurrency(product.price) }),
        createElement('button', { type: 'button', onClick: () => handleAddToCart(product) }, 'Adicionar ao carrinho'),
        createElement('h3', { text: 'Detalhes do produto' }),
        createElement(
          'ul',
          { className: 'product-detail-list' },
          product.details.map((detail) =>
            createElement(
              'li',
              null,
              createElement('strong', { text: `${detail.label}: ` }),
              detail.value,
            ),
          ),
        ),
      ),
    ),
  )
}

function renderPlayersPage() {
  const players = appState.players

  // Select de equipas com opção correta selecionada
  const teamOptions = [
    { value: 'all', label: 'Todas as equipas' },
    ...appState.teams.map((t) => ({ value: String(t.id), label: t.full_name })),
  ]
  const teamSelect = createSelect(
    { id: 'teamFilter', onChange: (e) => handlePlayerTeam(e.target.value) },
    teamOptions,
    String(appState.playerFilters.team),
  )

  const searchInput = createElement('input', {
    id: 'playerSearch',
    type: 'text',
    placeholder: 'Digite um nome...',
    onInput: (e) => handlePlayerQuery(e.target.value),
  })
  searchInput.value = appState.playerFilters.query

  return createElement(
    'div',
    null,
    renderFilters(searchInput, teamSelect),
    createElement(
      'section',
      { className: 'section-block' },
      createElement('div', { className: 'section-heading' },
        createElement('div', null,
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

  const searchInput = createElement('input', {
    id: 'teamSearch',
    type: 'text',
    placeholder: 'Digite o nome da equipa...',
    onInput: (e) => handleTeamSearch(e.target.value),
  })
  searchInput.value = appState.teamSearch

  return createElement(
    'div',
    null,
    renderFilters(searchInput),
    createElement(
      'section',
      { className: 'section-block' },
      createElement('div', { className: 'section-heading' },
        createElement('div', null,
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
      createElement('div', null,
        createElement('h2', { text: 'Carrinho' }),
        createElement('p', { text: 'Os seus itens guardados localmente.' }),
      ),
      createElement('button', { type: 'button', onClick: handleClearCart, disabled: appState.cart.length === 0 }, 'Esvaziar carrinho'),
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
    createElement('p', { html: 'Este site foi criado com JavaScript puro, consumindo dados reais da API <strong>balldontlie.io</strong> e usando HTML, CSS e DOM.' }),
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

function renderProductCard(product) {
  return createElement(
    'article',
    { className: 'product-card' },
    createElement('div', { className: 'product-img-wrap' },
      createElement('img', {
        src: product.image,
        alt: product.name,
        className: 'product-img',
      }),
      createElement('span', { className: 'product-category-badge', text: product.category }),
    ),
    createElement('div', { className: 'product-copy' },
      createElement('p', { className: 'product-team', text: product.team }),
      createElement('h3', null, product.name),
    ),
    createElement('div', { className: 'product-footer' },
      createElement('span', { className: 'product-price', text: formatCurrency(product.price) }),
      createElement(
        'div',
        { className: 'product-footer-actions' },
        createElement('a', { className: 'detail-link', href: `#product/${product.id}` }, 'Ver detalhes'),
        createElement('button', { type: 'button', onClick: () => handleAddToCart(product) }, 'Adicionar'),
      ),
    ),
  )
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

  const bodyRows = players.map((player) => {
    const isSelected = appState.selectedPlayerId === player.id
    const row = createElement(
      'tr',
      { className: isSelected ? 'selected-row' : '' },
      createElement('td', { className: 'player-name-cell', text: player.name }),
      createElement('td', null, createElement('span', { className: 'pos-badge', text: player.position })),
      createElement('td', { text: player.team }),
      createElement('td', { text: player.conference }),
      createElement('td', { text: player.division }),
      createElement(
        'td',
        null,
        createElement(
          'button',
          {
            type: 'button',
            className: 'stats-btn',
            onClick: () => handlePlayerStats(player.id, player.name),
          },
          isSelected && appState.playerStats ? 'Fechar' : 'Ver stats',
        ),
      ),
    )
    return row
  })

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

function renderPlayerStatsArea() {
  if (appState.loadingStats) {
    return createElement('p', { className: 'empty', text: 'A carregar estatísticas...' })
  }
  if (appState.errorStats) {
    return createElement('p', { className: 'empty', text: appState.errorStats })
  }
  if (!appState.playerStats || !appState.playerStats.loaded) {
    return createElement('p', { className: 'empty', text: 'Clica em "Ver stats" para ver as médias do jogador.' })
  }
  if (!appState.playerStats.data || appState.playerStats.data.length === 0) {
    return createElement('p', { className: 'empty', text: `Sem estatísticas disponíveis para ${appState.playerStats.playerName} em 2024.` })
  }

  const raw = appState.playerStats.data[0]
  // novo endpoint devolve stats dentro de raw.stats
  const stats = raw.stats || raw
  return createElement(
    'div',
    { className: 'stats-panel' },
    createElement('h3', { text: `Médias de ${appState.playerStats.playerName} — Época ${appState.playerStats.season}` }),
    createElement('div', { className: 'stats-grid' },
      createElement('div', { className: 'stat-item' }, createElement('span', { className: 'stat-value', text: (stats.pts ?? 0).toFixed(1) }), createElement('span', { className: 'stat-label', text: 'PTS' })),
      createElement('div', { className: 'stat-item' }, createElement('span', { className: 'stat-value', text: (stats.reb ?? 0).toFixed(1) }), createElement('span', { className: 'stat-label', text: 'REB' })),
      createElement('div', { className: 'stat-item' }, createElement('span', { className: 'stat-value', text: (stats.ast ?? 0).toFixed(1) }), createElement('span', { className: 'stat-label', text: 'AST' })),
      createElement('div', { className: 'stat-item' }, createElement('span', { className: 'stat-value', text: (stats.stl ?? 0).toFixed(1) }), createElement('span', { className: 'stat-label', text: 'STL' })),
      createElement('div', { className: 'stat-item' }, createElement('span', { className: 'stat-value', text: (stats.blk ?? 0).toFixed(1) }), createElement('span', { className: 'stat-label', text: 'BLK' })),
      createElement('div', { className: 'stat-item' }, createElement('span', { className: 'stat-value', text: stats.min ?? '—' }), createElement('span', { className: 'stat-label', text: 'MIN' })),
    ),
  )
}

function renderGameCard(game) {
  const home = game.home_team?.abbreviation || 'N/A'
  const visitor = game.visitor_team?.abbreviation || 'N/A'
  const score = `${game.home_team_score || 0} – ${game.visitor_team_score || 0}`
  const date = new Date(game.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return createElement(
    'article',
    { className: 'game-card' },
    createElement('div', { className: 'game-teams' },
      createElement('span', { text: home }),
      createElement('span', { className: 'game-score', text: score }),
      createElement('span', { text: visitor }),
    ),
    createElement('p', { className: 'game-date', text: date }),
    createElement('p', { className: 'game-status', text: game.status || '' }),
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
    createElement('div', null,
      createElement('h3', { text: item.name }),
      createElement('p', { text: `Quantidade: ${item.quantity}` }),
      createElement('p', { className: 'price', text: formatCurrency(item.price) }),
    ),
    createElement('div', { className: 'cart-actions' },
      createElement('button', { type: 'button', onClick: () => handleUpdateQuantity(item.id, -1) }, '−'),
      createElement('span', null, item.quantity),
      createElement('button', { type: 'button', onClick: () => handleUpdateQuantity(item.id, 1) }, '+'),
      createElement('button', { className: 'remove-btn', type: 'button', onClick: () => handleRemoveItem(item.id) }, 'Remover'),
    ),
  )
}

// ── Handlers ──

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
  loadPlayers()
}

function handlePlayerTeam(value) {
  appState.playerFilters.team = value
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

// ── Async ──

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
  // Se clicar no mesmo jogador, fecha o painel
  if (appState.selectedPlayerId === playerId && appState.playerStats) {
    appState.selectedPlayerId = null
    appState.playerStats = null
    render()
    return
  }

  appState.selectedPlayerId = playerId
  appState.loadingStats = true
  appState.errorStats = ''
  appState.playerStats = null
  render()

  try {
    // Tenta épocas de 2024 até 2020 até encontrar dados
    let found = false
    for (const season of [2024, 2023, 2022, 2021, 2020]) {
      const data = await fetchPlayerStats({ playerId, season })
      if (data.data && data.data.length > 0) {
        appState.playerStats = { data: data.data, playerName, season, loaded: true }
        found = true
        break
      }
    }
    if (!found) {
      appState.playerStats = { data: [], playerName, season: 2024, loaded: true }
    }
  } catch (error) {
    appState.errorStats = 'Erro ao carregar estatísticas: ' + error.message
    appState.playerStats = null
  } finally {
    appState.loadingStats = false
    render()
  }
}

function handleRouteChange() {
  appState.route = getCurrentRoute()
  if (!ROUTES.some((item) => item.key === appState.route) && !appState.route.startsWith('product/')) {
    appState.route = DEFAULT_ROUTE
  }
  render()
}

function initializeApp() {
  if (!root) return
  render()
  loadTeams()
  loadPlayers()
  loadGames()
  window.addEventListener('hashchange', handleRouteChange)
}

initializeApp()