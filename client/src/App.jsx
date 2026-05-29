import { useEffect, useMemo, useState } from 'react'
import { fetchPlayers, fetchTeams } from './api'
import './App.css'

const ROUTES = [
  { key: 'home',     label: 'Início' },
  { key: 'products', label: 'Produtos' },
  { key: 'players',  label: 'Jogadores' },
  { key: 'teams',    label: 'Equipas' },
  { key: 'cart',     label: 'Carrinho' },
  { key: 'about',    label: 'Sobre' },
]

const DEFAULT_ROUTE = 'home'

// ---------------------------------------------------------------------------
// Catálogo de produtos da loja (camisolas, bolas, etc.)
// Coloca as imagens em /public/products/ com o nome indicado no campo "image"
// ---------------------------------------------------------------------------
const STORE_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Camisola Lakers – LeBron #23',
    team: 'Los Angeles Lakers',
    category: 'Camisola',
    price: 89.99,
    image: 'camisola-lakers-lebron.jpg',
  },
  {
    id: 'prod-2',
    name: 'Camisola Warriors – Curry #30',
    team: 'Golden State Warriors',
    category: 'Camisola',
    price: 89.99,
    image: 'camisola-warriors-curry.jpg',
  },
  {
    id: 'prod-3',
    name: 'Camisola Bulls – Jordan #23',
    team: 'Chicago Bulls',
    category: 'Camisola',
    price: 94.99,
    image: 'camisola-bulls-jordan.jpg',
  },
  {
    id: 'prod-4',
    name: 'Camisola Celtics – Tatum #0',
    team: 'Boston Celtics',
    category: 'Camisola',
    price: 84.99,
    image: 'camisola-celtics-tatum.jpg',
  },
  {
    id: 'prod-5',
    name: 'Bola NBA Official Game Ball',
    team: 'NBA',
    category: 'Bola',
    price: 149.99,
    image: 'bola-nba-official.jpg',
  },
  {
    id: 'prod-6',
    name: 'Bola de Treino NBA',
    team: 'NBA',
    category: 'Bola',
    price: 49.99,
    image: 'bola-treino-nba.jpg',
  },
  {
    id: 'prod-7',
    name: 'Boné NBA – Lakers Edition',
    team: 'Los Angeles Lakers',
    category: 'Acessório',
    price: 34.99,
    image: 'bone-lakers.jpg',
  },
  {
    id: 'prod-8',
    name: 'Mochila NBA – Warriors',
    team: 'Golden State Warriors',
    category: 'Acessório',
    price: 59.99,
    image: 'mochila-warriors.jpg',
  },
]

const PRODUCT_CATEGORIES = ['Todos', ...Array.from(new Set(STORE_PRODUCTS.map((p) => p.category)))]

function getCurrentRoute() {
  return window.location.hash.replace('#', '') || DEFAULT_ROUTE
}

function App() {
  const [route, setRoute] = useState(getCurrentRoute)

  // ---------- Estado de jogadores / equipas ----------
  const [players, setPlayers]       = useState([])
  const [teams, setTeams]           = useState([])
  const [playerFilters, setPlayerFilters] = useState({ query: '', team: 'all' })
  const [teamSearch, setTeamSearch] = useState('')
  const [loading, setLoading]       = useState({ players: false, teams: false })
  const [errors, setErrors]         = useState({ players: '', teams: '' })

  // ---------- Estado do carrinho ----------
  const [cart, setCart] = useState(() =>
    JSON.parse(window.localStorage.getItem('basketCart') || '[]'),
  )

  // ---------- Estado dos produtos ----------
  const [productCategory, setProductCategory] = useState('Todos')
  const [productSearch, setProductSearch]     = useState('')

  // Navegação por hash
  useEffect(() => {
    const handleHash = () => setRoute(getCurrentRoute())
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // Persistir carrinho
  useEffect(() => {
    window.localStorage.setItem('basketCart', JSON.stringify(cart))
  }, [cart])

  // Carregar equipas
  useEffect(() => {
    async function loadTeams() {
      setLoading((prev) => ({ ...prev, teams: true }))
      try {
        const data = await fetchTeams()
        setTeams(data.data)
        setErrors((prev) => ({ ...prev, teams: '' }))
      } catch (err) {
        setErrors((prev) => ({ ...prev, teams: err.message }))
      } finally {
        setLoading((prev) => ({ ...prev, teams: false }))
      }
    }
    loadTeams()
  }, [])

  // Carregar jogadores quando filtros mudam
  useEffect(() => {
    async function loadPlayers() {
      setLoading((prev) => ({ ...prev, players: true }))
      try {
        const data = await fetchPlayers({
          search: playerFilters.query,
          team: playerFilters.team,
          perPage: 60,
          page: 1,
        })
        const mapped = data.data.map((p) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          team: p.team.full_name,
          teamAbbr: p.team.abbreviation || 'N/D',
          position: p.position || 'N/D',
          conference: p.team.conference || '',
          division: p.team.division || '',
        }))
        setPlayers(mapped)
        setErrors((prev) => ({ ...prev, players: '' }))
      } catch (err) {
        setErrors((prev) => ({ ...prev, players: err.message }))
      } finally {
        setLoading((prev) => ({ ...prev, players: false }))
      }
    }
    loadPlayers()
  }, [playerFilters])

  // Filtros derivados
  const filteredTeams = useMemo(
    () => teams.filter((t) => t.full_name.toLowerCase().includes(teamSearch.toLowerCase())),
    [teams, teamSearch],
  )

  const filteredProducts = useMemo(() => {
    return STORE_PRODUCTS.filter((p) => {
      const matchCat = productCategory === 'Todos' || p.category === productCategory
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.team.toLowerCase().includes(productSearch.toLowerCase())
      return matchCat && matchSearch
    })
  }, [productCategory, productSearch])

  // Totais do carrinho
  const cartItemCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart])
  const cartTotal     = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart])

  // Ações do carrinho
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  const updateCartQuantity = (id, change) => {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + change) } : i)
        .filter((i) => i.quantity > 0),
    )
  }

  const removeCartItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id))
  const clearCart = () => setCart([])
  const checkout = () => {
    setCart([])
    window.alert('Compra finalizada! Obrigado pela preferência.')
  }

  // =========================================================================
  // PÁGINAS
  // =========================================================================

  const pageHome = (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">BALLOUT</span>
          <h1>NBA Store Reloaded</h1>
          <p>
            Loja de basketball com dados reais da API <strong>balldontlie.io</strong>.<br />
            Produtos oficiais, jogadores e equipas numa só plataforma.
          </p>
          <div className="hero-actions">
            <a className="hero-button" href="#products">Ver produtos</a>
            <a className="hero-link" href="#players">Ver jogadores</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <h2>O que encontras aqui</h2>
            <p>Camisolas, bolas e acessórios oficiais, mais informação real sobre jogadores e equipas NBA.</p>
            <div className="hero-tags">
              <span>🏀 Produtos oficiais</span>
              <span>👟 Jogadores reais</span>
              <span>🏆 Equipas NBA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Destaques de produtos */}
      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Produtos em destaque</h2>
            <p>Os artigos mais populares da loja.</p>
          </div>
          <a href="#products" className="view-all-link">Ver todos →</a>
        </div>
        <div className="cards-grid">
          {STORE_PRODUCTS.slice(0, 4).map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-img-wrap">
                <img src={`/products/${product.image}`} alt={product.name} />
                <span className="product-category-badge">{product.category}</span>
              </div>
              <div className="product-copy">
                <p className="product-team">{product.team}</p>
                <h3>{product.name}</h3>
              </div>
              <div className="product-footer">
                <span className="product-price">€{product.price.toFixed(2)}</span>
                <button type="button" onClick={() => handleAddToCart(product)}>Adicionar</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )

  const pageProducts = (
    <>
      <section className="filters">
        <div className="filter-group">
          <label htmlFor="productSearch">Pesquisar produto</label>
          <input
            id="productSearch"
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Camisola, bola, equipa..."
          />
        </div>
        <div className="filter-group">
          <label htmlFor="categoryFilter">Categoria</label>
          <select
            id="categoryFilter"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Produtos</h2>
            <p>Camisolas, bolas e acessórios oficiais NBA.</p>
          </div>
          <span>{filteredProducts.length} artigos</span>
        </div>
        <div className="cards-grid">
          {filteredProducts.length === 0 && (
            <p className="empty">Nenhum produto encontrado.</p>
          )}
          {filteredProducts.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-img-wrap">
                <img src={`/products/${product.image}`} alt={product.name} />
                <span className="product-category-badge">{product.category}</span>
              </div>
              <div className="product-copy">
                <p className="product-team">{product.team}</p>
                <h3>{product.name}</h3>
              </div>
              <div className="product-footer">
                <span className="product-price">€{product.price.toFixed(2)}</span>
                <button type="button" onClick={() => handleAddToCart(product)}>Adicionar</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )

  const pagePlayers = (
    <>
      <section className="filters">
        <div className="filter-group">
          <label htmlFor="playerSearch">Buscar jogador</label>
          <input
            id="playerSearch"
            type="text"
            value={playerFilters.query}
            onChange={(e) => setPlayerFilters((prev) => ({ ...prev, query: e.target.value }))}
            placeholder="Digite um nome..."
          />
        </div>
        <div className="filter-group">
          <label htmlFor="teamFilter">Filtrar por equipa</label>
          <select
            id="teamFilter"
            value={playerFilters.team}
            onChange={(e) => setPlayerFilters((prev) => ({ ...prev, team: e.target.value }))}
          >
            <option value="all">Todas as equipas</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Jogadores NBA</h2>
            <p>Dados reais via balldontlie.io.</p>
          </div>
          <span>{players.length} resultados</span>
        </div>

        {loading.players && <p className="empty">A carregar jogadores...</p>}
        {errors.players && <p className="empty">{errors.players}</p>}
        {!loading.players && !errors.players && players.length === 0 && (
          <p className="empty">Nenhum jogador encontrado.</p>
        )}

        <div className="players-table-wrap">
          {players.length > 0 && (
            <table className="players-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Posição</th>
                  <th>Equipa</th>
                  <th>Conferência</th>
                  <th>Divisão</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td className="player-name-cell">{player.name}</td>
                    <td><span className="pos-badge">{player.position}</span></td>
                    <td>{player.team}</td>
                    <td>{player.conference}</td>
                    <td>{player.division}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  )

  const pageTeams = (
    <>
      <section className="filters">
        <div className="filter-group full-width">
          <label htmlFor="teamSearch">Pesquisar equipa</label>
          <input
            id="teamSearch"
            type="text"
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            placeholder="Digite o nome da equipa..."
          />
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Equipas NBA</h2>
            <p>Equipas oficiais retornadas pela API.</p>
          </div>
          <span>{filteredTeams.length} equipas</span>
        </div>

        <div className="cards-grid team-grid">
          {loading.teams && <p className="empty">A carregar equipas...</p>}
          {errors.teams && <p className="empty">{errors.teams}</p>}
          {!loading.teams && !errors.teams && filteredTeams.length === 0 && (
            <p className="empty">Nenhuma equipa encontrada.</p>
          )}
          {filteredTeams.map((team) => (
            <article key={team.id} className="team-card">
              <div className="team-abbr">{team.abbreviation}</div>
              <h3>{team.full_name}</h3>
              <p>{team.city}</p>
              <p>{team.conference} Conference</p>
              <p>{team.division} Division</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )

  const pageCart = (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <h2>Carrinho</h2>
          <p>Os seus itens guardados localmente.</p>
        </div>
        <button type="button" onClick={clearCart} disabled={cart.length === 0}>
          Esvaziar carrinho
        </button>
      </div>

      {cart.length === 0 ? (
        <p className="empty">O seu carrinho está vazio.</p>
      ) : (
        <div className="cart-grid">
          <div className="cart-items">
            {cart.map((item) => (
              <article key={item.id} className="cart-item">
                <div>
                  <h3>{item.name}</h3>
                  <p>Quantidade: {item.quantity}</p>
                  <p className="price">€{item.price.toFixed(2)} / un.</p>
                </div>
                <div className="cart-actions">
                  <button type="button" onClick={() => updateCartQuantity(item.id, -1)}>−</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateCartQuantity(item.id, 1)}>+</button>
                  <button type="button" className="remove-btn" onClick={() => removeCartItem(item.id)}>
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>
          <article className="checkout-card">
            <h3>Resumo</h3>
            <p>Total de itens: {cartItemCount}</p>
            <p className="price">Total: €{cartTotal.toFixed(2)}</p>
            <button type="button" onClick={checkout}>Finalizar compra</button>
          </article>
        </div>
      )}
    </section>
  )

  const pageAbout = (
    <section className="section-block about-card">
      <h2>Sobre este projeto</h2>
      <p>
        Este site foi criado com React + Vite, usando dados reais da API{' '}
        <strong>balldontlie.io</strong>.
      </p>
      <ul>
        <li>Secção de <strong>Produtos</strong> independente (camisolas, bolas, acessórios)</li>
        <li>Secção de <strong>Jogadores</strong> apenas informativa, sem compra</li>
        <li>Secção de <strong>Equipas</strong> NBA com dados reais</li>
        <li>Pesquisa, filtros e carrinho persistido em localStorage</li>
        <li>Design responsivo e moderno</li>
      </ul>
    </section>
  )

  const pages = {
    home: pageHome,
    products: pageProducts,
    players: pagePlayers,
    teams: pageTeams,
    cart: pageCart,
    about: pageAbout,
  }

  return (
    <div className="app-wrapper">
      <header className="topbar">
        <div className="brand">
          <a href="#home">
            <h1>Basket Store</h1>
            <p>NBA real, experiência nova.</p>
          </a>
        </div>
        <nav>
          {ROUTES.map((item) => (
            <a
              key={item.key}
              href={`#${item.key}`}
              className={route === item.key ? 'active' : ''}
            >
              {item.label}
              {item.key === 'cart' && cartItemCount > 0 && (
                <span className="badge">{cartItemCount}</span>
              )}
            </a>
          ))}
        </nav>
      </header>

      <main className="main-content">{pages[route] || pages.home}</main>
    </div>
  )
}

export default App
