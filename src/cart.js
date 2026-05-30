const CART_STORAGE_KEY = 'basketCart'

export function loadCart() {
  try {
    return JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]')
  } catch (err) {
    console.error('Failed to load cart from localStorage', err)
    return []
  }
}

export function saveCart(cart) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

export function addToCart(cart, product) {
  const existing = cart.find((item) => item.id === product.id)
  if (existing) {
    return cart.map((item) =>
      item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
    )
  }

  return [...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }]
}

export function updateCartQuantity(cart, id, change) {
  return cart
    .map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item,
    )
    .filter((item) => item.quantity > 0)
}

export function removeCartItem(cart, id) {
  return cart.filter((item) => item.id !== id)
}

export function clearCart() {
  return []
}
