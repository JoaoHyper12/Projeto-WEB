const cartItemsContainer = document.getElementById('cartItems');
const cartSummary = document.getElementById('cartSummary');
const clearCartButton = document.getElementById('clearCart');

function loadCart() {
  const cart = JSON.parse(localStorage.getItem('basketCart') || '[]');
  renderCart(cart);
}

function renderCart(cart) {
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="cart-empty">O seu carrinho está vazio.</p>';
    cartSummary.innerHTML = '';
    return;
  }

  cart.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'cart-item';
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p class="price">${item.price}€</p>
      <p>Quantidade: <span class="quantity">${item.quantity}</span></p>
      <div class="cart-actions">
        <button type="button" class="decrease">-</button>
        <button type="button" class="increase">+</button>
        <button type="button" class="remove">Remover</button>
      </div>
    `;

    card.querySelector('.decrease').addEventListener('click', () => updateQuantity(item.id, -1));
    card.querySelector('.increase').addEventListener('click', () => updateQuantity(item.id, 1));
    card.querySelector('.remove').addEventListener('click', () => removeItem(item.id));

    cartItemsContainer.appendChild(card);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartSummary.innerHTML = `
    <h3>Resumo do carrinho</h3>
    <p>Total de itens: ${cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
    <p class="price">Total: ${total.toFixed(2)}€</p>
    <button id="checkoutButton" type="button">Finalizar compra</button>
  `;

  document.getElementById('checkoutButton').addEventListener('click', checkoutCart);
}

function saveCart(cart) {
  localStorage.setItem('basketCart', JSON.stringify(cart));
  loadCart();
}

function removeItem(productId) {
  const cart = JSON.parse(localStorage.getItem('basketCart') || '[]');
  const updated = cart.filter((item) => item.id !== productId);
  saveCart(updated);
}

function updateQuantity(productId, change) {
  const cart = JSON.parse(localStorage.getItem('basketCart') || '[]');
  const updated = cart.map((item) => {
    if (item.id === productId) {
      return { ...item, quantity: Math.max(1, item.quantity + change) };
    }
    return item;
  });
  saveCart(updated);
}

function checkoutCart() {
  localStorage.removeItem('basketCart');
  alert('Compra finalizada! Obrigado pela sua preferência.');
  loadCart();
}

clearCartButton.addEventListener('click', () => {
  localStorage.removeItem('basketCart');
  loadCart();
});

loadCart();
