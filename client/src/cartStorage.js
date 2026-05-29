export function loadCart() {
  return JSON.parse(window.localStorage.getItem('basketCart') || '[]');
}

export function saveCart(cart) {
  window.localStorage.setItem('basketCart', JSON.stringify(cart));
}

export function getCartItemCount(cart) {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}
