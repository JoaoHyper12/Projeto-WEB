import { useEffect, useMemo, useState } from 'react'
import { fetchPlayers, fetchTeams } from './api'
import './App.css'

const ROUTES = [
  { key: 'home', label: 'Início' },
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
  const [teams, setTeams] = useState([])
  const [filters, setFilters] = useState({ query: '', team: 'all' })
  const [teamSearch, setTeamSearch] = useState('')
  const [loading, setLoading] = useState({ players: false, teams: false })
  const [errors, setErrors] = useState({ players: '', teams: '' })
  const [cart, setCart] = useState(() => JSON.parse(window.localStorage.getItem('basketCart') || '[]'))

  useEffect(() => {
    const handleHash = () => setRoute(getCurrentRoute())
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('basketCart', JSON.stringify(cart))
  }, [cart])

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
    async function loadPlayers() {
      setLoading((previous) => ({ ...previous, players: true }))
      try {
        const playerData = await fetchPlayers({
          search: filters.query,
          team: filters.team,
          perPage: 60,
          page: 1,
        })

        const mapped = playerData.data.map((player) => ({
          id: `player-${player.id}`,
          name: `${player.first_name} ${player.last_name}`,
          subtitle: player.team.full_name,
          category: player.team.abbreviation || 'N/D',
          position: player.position || 'N/D',
          price: player.position === 'C' ? 14.99 : 12.99,
          image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=70',
        }))

        setProducts(mapped)
        setErrors((previous) => ({ ...previous, players: '' }))
      } catch (error) {
        setErrors((previous) => ({ ...previous, players: error.message }))
      } finally {
        setLoading((previous) => ({ ...previous, players: false }))
      }
    }

    loadPlayers()
  }, [filters])

  const filteredTeams = useMemo(
    () => teams.filter((team) => team.full_name.toLowerCase().includes(teamSearch.toLowerCase())),
    [teams, teamSearch],
  )

  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])

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
    window.alert('Compra finalizada! Obrigado pela preferência.')
  }

  const pageContent = {
    home: (
      <>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">BALLOUT</span>
            <h1>NBA Store Reloaded</h1>
            <p>Uma loja de basketball renovada com dados reais da API <strong>balldontlie.io</strong>.</p>
            <div className="hero-actions">
              <a className="hero-button" href="#players">Ver jogadores</a>
              <a className="hero-link" href="#teams">Ver equipas</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <h2>Descubra a nova experiência</h2>
              <p>Pesquisa, filtros e carrinho local em um layout moderno e responsivo.</p>
              <div className="hero-tags">
                <span>React + Vite</span>
                <span>API real</span>
                <span>Design novo</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>Jogadores em destaque</h2>
              <p>Os principais jogadores retornados pela API estão disponíveis abaixo.</p>
            </div>
            <span>{products.length} itens</span>
          </div>

          <div className="cards-grid">
            {loading.players && <p className="empty">A carregar jogadores...</p>}
            {errors.players && <p className="empty">{errors.players}</p>}
            {!loading.players && !errors.players && products.length === 0 && <p className="empty">Nenhum jogador encontrado.</p>}
            {products.slice(0, 8).map((product) => (
              <article key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <div className="product-copy">
                  <p className="product-tag">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p>{product.subtitle}</p>
                </div>
                <div className="product-footer">
                  <span>€{product.price.toFixed(2)}</span>
                  <button type="button" onClick={() => handleAddToCart(product.id)}>Adicionar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </>
    ),
    players: (
      <>
        <section className="filters">
          <div className="filter-group">
            <label htmlFor="playerSearch">Buscar jogador</label>
            <input
              id="playerSearch"
              type="text"
              value={filters.query}
              onChange={(event) => setFilters((previous) => ({ ...previous, query: event.target.value }))}
              placeholder="Digite um nome..."
            />
          </div>
          <div className="filter-group">
            <label htmlFor="teamFilter">Filtrar por equipa</label>
            <select
              id="teamFilter"
              value={filters.team}
              onChange={(event) => setFilters((previous) => ({ ...previous, team: event.target.value }))}
            >
              <option value="all">Todas as equipas</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.full_name}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>Jogadores</h2>
              <p>E veja os resultados filtrados em tempo real.</p>
            </div>
            <span>{products.length} resultados</span>
          </div>

          <div className="cards-grid">
            {loading.players && <p className="empty">A carregar jogadores...</p>}
            {errors.players && <p className="empty">{errors.players}</p>}
            {!loading.players && !errors.players && products.length === 0 && <p className="empty">Nenhum jogador encontrado.</p>}
            {products.map((player) => (
              <article key={player.id} className="product-card">
                <img src={player.image} alt={player.name} />
                <div className="product-copy">
                  <p className="product-tag">{player.category}</p>
                  <h3>{player.name}</h3>
                  <p>{player.position} • {player.subtitle}</p>
                </div>
                <div className="product-footer">
                  <span>€{player.price.toFixed(2)}</span>
                  <button type="button" onClick={() => handleAddToCart(player.id)}>Adicionar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </>
    ),
    teams: (
      <>
        <section className="filters">
          <div className="filter-group full-width">
            <label htmlFor="teamSearch">Pesquisar equipa</label>
            <input
              id="teamSearch"
              type="text"
              value={teamSearch}
              onChange={(event) => setTeamSearch(event.target.value)}
              placeholder="Digite o nome da equipa..."
            />
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div>
              <h2>Equipas</h2>
              <p>Veja as equipas oficiais retornadas pela API.</p>
            </div>
            <span>{filteredTeams.length} equipas</span>
          </div>

          <div className="cards-grid team-grid">
            {loading.teams && <p className="empty">A carregar equipas...</p>}
            {errors.teams && <p className="empty">{errors.teams}</p>}
            {!loading.teams && !errors.teams && filteredTeams.length === 0 && <p className="empty">Nenhuma equipa encontrada.</p>}
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
    ),
    cart: (
      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Carrinho</h2>
            <p>Os seus itens guardados localmente.</p>
          </div>
          <button type="button" onClick={clearCart} disabled={cart.length === 0}>Esvaziar carrinho</button>
        </div>

        {cart.length === 0 ? (
          <p className="empty">O seu carrinho está vazio.</p>
        ) : (
          <div className="cart-grid">
            {cart.map((item) => (
              <article key={item.id} className="cart-item">
                <div>
                  <h3>{item.name}</h3>
                  <p>Quantidade: {item.quantity}</p>
                  <p className="price">€{item.price.toFixed(2)}</p>
                </div>
                <div className="cart-actions">
                  <button type="button" onClick={() => updateCartQuantity(item.id, -1)}>-</button>
                  <button type="button" onClick={() => updateCartQuantity(item.id, 1)}>+</button>
                  <button type="button" onClick={() => removeCartItem(item.id)}>Remover</button>
                </div>
              </article>
            ))}
            <article className="checkout-card">
              <h3>Resumo</h3>
              <p>Total de itens: {cartItemCount}</p>
              <p className="price">Total: €{cartTotal.toFixed(2)}</p>
              <button type="button" onClick={checkout}>Finalizar compra</button>
            </article>
          </div>
        )}
      </section>
    ),
    about: (
      <section className="section-block about-card">
        <h2>Sobre este projeto</h2>
        <p>Este site foi recriado do zero usando React e dados da API <strong>balldontlie.io</strong>.</p>
        <ul>
          <li>Produtos mapeados a partir de jogadores reais</li>
          <li>Pesquisa, filtros e carrinho dinâmico</li>
          <li>Estilo novo, limpo e responsivo</li>
        </ul>
      </section>
    ),
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
            <a key={item.key} href={`#${item.key}`} className={route === item.key ? 'active' : ''}>
              {item.label}
              {item.key === 'cart' && <span className="badge">{cartItemCount}</span>}
            </a>
          ))}
        </nav>
      </header>

      <main className="main-content">{pageContent[route] || pageContent.home}</main>
    </div>
  )
}

export default App
