import { useEffect, useMemo, useState } from 'react'
import { fetchPlayerPreview, fetchPlayers, fetchProducts, fetchTeams } from './api'
import { getCartItemCount, getCartTotal, loadCart, saveCart } from './cartStorage'
import './App.css'

const ROUTES = [
  { key: 'home', label: 'Loja' },
  { key: 'players', label: 'Jogadores' },
  { key: 'teams', label: 'Equipas' },
  { key: 'cart', label: 'Carrinho' },
  { key: 'about', label: 'Sobre' },
]

const DEFAULT_ROUTE = 'home'

function getCurrentRoute() {
  return window.location.hash.replace('#', '') || DEFAULT_ROUTE
}

function App() {
  const [route, setRoute] = useState(getCurrentRoute)
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [previewPlayers, setPreviewPlayers] = useState([])
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [playerFilters, setPlayerFilters] = useState({ query: '', team: 'all', position: 'all' })
  const [teamFilters, setTeamFilters] = useState({ query: '', conference: 'all' })
  const [playerPage, setPlayerPage] = useState(1)
  const [hasMorePlayers, setHasMorePlayers] = useState(false)
  const [cart, setCart] = useState(() => loadCart())
  const [toast, setToast] = useState('')
  const [errors, setErrors] = useState({ products: '', preview: '', players: '', teams: '' })
  const [loading, setLoading] = useState({ products: false, preview: false, players: false, teams: false })

  useEffect(() => {
    const handleHash = () => setRoute(getCurrentRoute())
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  useEffect(() => {
    async function loadProducts() {
      setLoading((previous) => ({ ...previous, products: true }))
      try {
        const productList = await fetchProducts()
        setProducts(productList)
        setErrors((previous) => ({ ...previous, products: '' }))
      } catch (error) {
        setErrors((previous) => ({ ...previous, products: error.message }))
      } finally {
        setLoading((previous) => ({ ...previous, products: false }))
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    async function loadPreview() {
      setLoading((previous) => ({ ...previous, preview: true }))
      try {
        const previewData = await fetchPlayerPreview()
        setPreviewPlayers(previewData.data)
        setErrors((previous) => ({ ...previous, preview: '' }))
      } catch (error) {
        setErrors((previous) => ({ ...previous, preview: error.message }))
      } finally {
        setLoading((previous) => ({ ...previous, preview: false }))
      }
    }

    loadPreview()
  }, [])

  useEffect(() => {
    async function loadTeams() {
      setLoading((previous) => ({ ...previous, teams: true }))
      try {
        const teamData = await fetchTeams()
        setTeams(teamData.data)
        setErrors((previous) => ({ ...previous, teams: '' }))
      } catch (error) {
        setErrors((previous) => ({ ...previous, teams: error.message }))
      } finally {
        setLoading((previous) => ({ ...previous, teams: false }))
      }
    }

    loadTeams()
  }, [])

  useEffect(() => {
    setPlayerPage(1)
    setPlayers([])
  }, [playerFilters])

  useEffect(() => {
    if (route !== 'players') {
      return
    }

    async function loadPlayers() {
      setLoading((previous) => ({ ...previous, players: true }))
      try {
        const playerData = await fetchPlayers({
          search: playerFilters.query,
          page: playerPage,
          perPage: 12,
        })

        const filtered = playerData.data.filter((player) => {
          const matchesTeam = playerFilters.team === 'all' || String(player.team.id) === playerFilters.team
          const matchesPosition = playerFilters.position === 'all' || player.position === playerFilters.position
          return matchesTeam && matchesPosition
        })

        setPlayers((previous) => (playerPage === 1 ? filtered : [...previous, ...filtered]))
        setHasMorePlayers(Boolean(playerData.meta.next_page))
        setErrors((previous) => ({ ...previous, players: '' }))
      } catch (error) {
        setErrors((previous) => ({ ...previous, players: error.message }))
      } finally {
        setLoading((previous) => ({ ...previous, players: false }))
      }
    }

    loadPlayers()
  }, [route, playerFilters, playerPage])

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = category === 'all' || product.category === category
        return matchesSearch && matchesCategory
      }),
    [products, searchTerm, category],
  )

  const filteredTeams = useMemo(
    () =>
      teams.filter((team) => {
        const matchesConference = teamFilters.conference === 'all' || team.conference === teamFilters.conference
        const matchesSearch = team.full_name.toLowerCase().includes(teamFilters.query.toLowerCase())
        return matchesConference && matchesSearch
      }),
    [teams, teamFilters],
  )

  const cartItemCount = useMemo(() => getCartItemCount(cart), [cart])
  const cartTotal = useMemo(() => getCartTotal(cart), [cart])

  const showToast = (message) => {
    setToast(message)
    window.clearTimeout(window.toastTimeout)
    window.toastTimeout = window.setTimeout(() => {
      setToast('')
    }, 1800)
  }

  const handleAddToCart = (productId) => {
    const product = products.find((item) => item.id === productId)
    if (!product) return

    setCart((previous) => {
      const existing = previous.find((item) => item.id === productId)
      if (existing) {
        return previous.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [...previous, { id: product.id, name: product.name, price: product.price, quantity: 1 }]
    })

    showToast(`"${product.name}" adicionado ao carrinho.`)
  }

  const updateCartQuantity = (productId, change) => {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeCartItem = (productId) => {
    setCart((previous) => previous.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const checkout = () => {
    setCart([])
    showToast('Compra finalizada! Obrigado pela preferência.')
  }

  const pageContent = {
    home: (
      <>
        <section className="hero">
          <div>
            <h1>Basket Store</h1>
            <p>Loja interativa de produtos de basketball com dados reais de jogadores NBA.</p>
            <p>Pesquisa, filtra e adiciona ao carrinho. A API externa carrega jogadores em tempo real.</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1000&q=80"
            alt="Quadra de basketball"
          />
        </section>

        <section className="filters">
          <div className="filter-group">
            <label htmlFor="searchInput">Pesquisar produtos</label>
            <input
              id="searchInput"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nome do produto..."
            />
          </div>

          <div className="filter-group">
            <label htmlFor="categoryFilter">Filtrar por categoria</label>
            <select id="categoryFilter" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">Todos</option>
              <option value="camisola">Camisolas</option>
              <option value="bola">Bolas</option>
              <option value="tenis">Ténis</option>
              <option value="equipamento">Equipamento</option>
            </select>
          </div>

          <div className="filter-group">
            <button type="button" onClick={() => {
              setSearchTerm('')
              setCategory('all')
            }}>
              Limpar filtros
            </button>
          </div>
        </section>

        <section>
          <div className="section-heading">
            <h2>Produtos</h2>
            <span>{filteredProducts.length} resultados</span>
          </div>
          <div className="cards-grid">
            {loading.products && <p className="empty">A carregar produtos...</p>}
            {errors.products && <p className="empty">{errors.products}</p>}
            {!loading.products && !errors.products && filteredProducts.length === 0 && (
              <p className="empty">Nenhum produto corresponde à pesquisa.</p>
            )}
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p className="price">{product.price}€</p>
                <p>Categoria: {product.category}</p>
                <button type="button" onClick={() => handleAddToCart(product.id)}>
                  Adicionar ao carrinho
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="nba-section">
          <div className="section-heading">
            <h2>Jogadores NBA em destaque</h2>
            <a href="#players">Ver todos os jogadores</a>
          </div>
          <div className="cards-grid">
            {loading.preview && <p className="empty">A carregar jogadores...</p>}
            {errors.preview && <p className="empty">{errors.preview}</p>}
            {!loading.preview && !errors.preview && previewPlayers.map((player) => (
              <article key={player.id} className="player-card">
                <h3>{player.first_name} {player.last_name}</h3>
                <p>Equipa: {player.team.full_name}</p>
                <p>Posição: {player.position || 'N/D'}</p>
              </article>
            ))}
          </div>
          <p className="small-note">Dados obtidos via API pública <strong>balldontlie.io</strong>.</p>
        </section>
      </>
    ),
    players: (
      <>
        <section className="filters">
          <div className="filter-group">
            <label htmlFor="playerSearch">Pesquisar jogador</label>
            <input
              id="playerSearch"
              type="text"
              value={playerFilters.query}
              onChange={(event) => setPlayerFilters((previous) => ({ ...previous, query: event.target.value }))}
              placeholder="LeBron, Curry, James..."
            />
          </div>
          <div className="filter-group">
            <label htmlFor="teamFilter">Filtrar por equipa</label>
            <select
              id="teamFilter"
              value={playerFilters.team}
              onChange={(event) => setPlayerFilters((previous) => ({ ...previous, team: event.target.value }))}
            >
              <option value="all">Todas as equipas</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="positionFilter">Filtrar por posição</label>
            <select
              id="positionFilter"
              value={playerFilters.position}
              onChange={(event) => setPlayerFilters((previous) => ({ ...previous, position: event.target.value }))}
            >
              <option value="all">Todas as posições</option>
              <option value="G">Guarda</option>
              <option value="F">Ala</option>
              <option value="C">Centro</option>
            </select>
          </div>
          <div className="filter-group">
            <button type="button" onClick={() => setPlayerPage((page) => page + 1)} disabled={!hasMorePlayers || loading.players}>
              {hasMorePlayers ? 'Carregar mais' : 'Sem mais jogadores'}
            </button>
          </div>
        </section>

        <section>
          <div className="section-heading">
            <h2>Resultados</h2>
            <span>{players.length} jogadores</span>
          </div>
          <div className="cards-grid">
            {loading.players && <p className="empty">A carregar jogadores...</p>}
            {errors.players && <p className="empty">{errors.players}</p>}
            {!loading.players && !errors.players && players.length === 0 && (
              <p className="empty">Nenhum jogador encontrado.</p>
            )}
            {players.map((player) => (
              <article key={player.id} className="player-card">
                <h3>{player.first_name} {player.last_name}</h3>
                <p>Equipa: {player.team.full_name}</p>
                <p>Posição: {player.position || 'N/D'}</p>
                <button type="button" onClick={() => alert(`Jogador: ${player.first_name} ${player.last_name}\nEquipa: ${player.team.full_name}\nPosição: ${player.position || 'N/D'}\nCidade: ${player.team.city}`)}>
                  Ver detalhes
                </button>
              </article>
            ))}
          </div>
        </section>
      </>
    ),
    teams: (
      <>
        <section className="filters">
          <div className="filter-group">
            <label htmlFor="conferenceFilter">Conferência</label>
            <select
              id="conferenceFilter"
              value={teamFilters.conference}
              onChange={(event) => setTeamFilters((previous) => ({ ...previous, conference: event.target.value }))}
            >
              <option value="all">Todas</option>
              <option value="East">Eastern</option>
              <option value="West">Western</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="teamSearch">Pesquisar equipa</label>
            <input
              id="teamSearch"
              type="text"
              value={teamFilters.query}
              onChange={(event) => setTeamFilters((previous) => ({ ...previous, query: event.target.value }))}
              placeholder="Lakers, Celtics, Bulls..."
            />
          </div>
        </section>

        <section>
          <div className="section-heading">
            <h2>Equipas</h2>
            <span>{filteredTeams.length} equipas</span>
          </div>
          <div className="cards-grid">
            {loading.teams && <p className="empty">A carregar equipas...</p>}
            {errors.teams && <p className="empty">{errors.teams}</p>}
            {!loading.teams && !errors.teams && filteredTeams.length === 0 && (
              <p className="empty">Nenhuma equipa encontrada.</p>
            )}
            {filteredTeams.map((team) => (
              <article key={team.id} className="team-card">
                <h3>{team.full_name}</h3>
                <p>Abreviatura: {team.abbreviation}</p>
                <p>Conferência: {team.conference}</p>
                <p>Divisão: {team.division}</p>
                <button
                  type="button"
                  onClick={() =>
                    alert(`Equipa: ${team.full_name}\nCidade: ${team.city}\nConferência: ${team.conference}\nDivisão: ${team.division}`)
                  }
                >
                  Ver estatísticas
                </button>
              </article>
            ))}
          </div>
        </section>
      </>
    ),
    cart: (
      <>
        <section className="section-heading">
          <h2>Carrinho</h2>
          <button type="button" onClick={clearCart} disabled={cart.length === 0}>
            Esvaziar carrinho
          </button>
        </section>

        <div className="cards-grid">
          {cart.length === 0 && <p className="cart-empty">O seu carrinho está vazio.</p>}
          {cart.map((item) => (
            <article key={item.id} className="cart-item">
              <h3>{item.name}</h3>
              <p className="price">{item.price}€</p>
              <p>Quantidade: {item.quantity}</p>
              <div className="cart-actions">
                <button type="button" onClick={() => updateCartQuantity(item.id, -1)}>-</button>
                <button type="button" onClick={() => updateCartQuantity(item.id, 1)}>+</button>
                <button type="button" onClick={() => removeCartItem(item.id)}>Remover</button>
              </div>
            </article>
          ))}
        </div>

        {cart.length > 0 && (
          <article className="product-card">
            <h3>Resumo do carrinho</h3>
            <p>Total de itens: {cartItemCount}</p>
            <p className="price">Total: {cartTotal.toFixed(2)}€</p>
            <button type="button" onClick={checkout}>
              Finalizar compra
            </button>
          </article>
        )}
      </>
    ),
    about: (
      <article className="product-card">
        <h2>Sobre o projeto</h2>
        <p>Este projeto é uma aplicação React que mostra produtos e dados de basketball.</p>
        <ul>
          <li>5 vistas distintas com navegação</li>
          <li>API externa: <strong>balldontlie.io</strong></li>
          <li>Fetch e async/await</li>
          <li>Filtragem e pesquisa de dados</li>
          <li>Armazenamento local no carrinho</li>
        </ul>
      </article>
    ),
  }

  return (
    <div className="app-wrapper">
      <header>
        <div className="brand">
          <h1>Basket Store</h1>
          <p>Dashboard interativo de basketball com loja e informação real.</p>
        </div>
        <nav>
          {ROUTES.map((item) => (
            <a key={item.key} href={`#${item.key}`} className={route === item.key ? 'active' : ''}>
              {item.label}
              {item.key === 'cart' && <span id="cartCount">{cartItemCount}</span>}
            </a>
          ))}
        </nav>
      </header>

      <main className="main-content">{pageContent[route] || pageContent.home}</main>

      {toast && <div className="toast visible">{toast}</div>}
    </div>
  )
}

export default App
