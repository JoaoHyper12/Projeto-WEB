const productsContainer = document.getElementById('productsContainer');
const nbaPreview = document.getElementById('nbaPreview');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const clearFilters = document.getElementById('clearFilters');
const toast = document.getElementById('toast');

let products = [];

async function loadProducts() {
  try {
    // Buscar jogadores da API balldontlie e mapear para produtos (placeholder de imagem)
    const response = await fetch('https://www.balldontlie.io/api/v1/players?per_page=24');
    if (!response.ok) throw new Error('Não foi possível carregar os produtos (API externa).');
    const data = await response.json();

    products = data.data.map((player) => ({
      id: `player-${player.id}`,
      name: `${player.first_name} ${player.last_name}`,
      price: 9.99,
      category: player.team && player.team.abbreviation ? player.team.abbreviation : 'N/D',
      image: '/images/placeholder-player.webp',
    }));
    showProducts(products);
    updateCartCount();
  } catch (error) {
    productsContainer.innerHTML = `<p class="empty">Erro ao carregar produtos: ${error.message}</p>`;
  }
}

function showProducts(list) {
  productsContainer.innerHTML = '';

  if (list.length === 0) {
    productsContainer.innerHTML = '<p class="empty">Nenhum produto corresponde à pesquisa.</p>';
    return;
  }

  list.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p class="price">${product.price}€</p>
      <p>Categoria: ${product.category}</p>
      <button type="button">Adicionar ao carrinho</button>
    `;

    card.querySelector('button').addEventListener('click', () => addToCart(product.id));
    productsContainer.appendChild(card);
  });
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const cart = JSON.parse(localStorage.getItem('basketCart') || '[]');
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  localStorage.setItem('basketCart', JSON.stringify(cart));
  updateCartCount();
  showToast(`"${product.name}" adicionado ao carrinho.`);
}

function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  const cart = JSON.parse(localStorage.getItem('basketCart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function filterProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    const matchesCategory = category === 'all' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  showProducts(filtered);
}

async function loadPlayerPreview() {
  try {
    const response = await fetch('https://www.balldontlie.io/api/v1/players?per_page=8');
    if (!response.ok) throw new Error('Erro ao carregar jogadores da API.');
    const data = await response.json();

    nbaPreview.innerHTML = '';
    data.data.forEach((player) => {
      const card = document.createElement('article');
      card.className = 'player-card';
      card.innerHTML = `
        <h3>${player.first_name} ${player.last_name}</h3>
        <p>Equipa: ${player.team.full_name}</p>
        <p>Posição: ${player.position || 'N/D'}</p>
      `;
      nbaPreview.appendChild(card);
    });
  } catch (error) {
    nbaPreview.innerHTML = `<p class="empty">Erro na API de jogadores: ${error.message}</p>`;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('visible');

  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
    toast.classList.add('hidden');
  }, 1800);
}

searchInput.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);
clearFilters.addEventListener('click', () => {
  searchInput.value = '';
  categoryFilter.value = 'all';
  filterProducts();
});

loadProducts();
loadPlayerPreview();
