// src/utils/cartUtils.js

// Safely get cart from localStorage
export const getCart = () => {
  try {
    const cart = JSON.parse(localStorage.getItem('cart'));
    return Array.isArray(cart) ? cart : [];
  } catch (err) {
    return [];
  }
};

// Save cart back to localStorage
export const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

// Get quantity of a specific product
export const getQuantity = (productId) => {
  const cart = getCart();
  const item = cart.find(p => p._id === productId);
  return item ? item.quantity : 0;
};

// Add a product to the cart
export const addToCart = (product) => {
  const cart = getCart();
  const existing = cart.find(p => p._id === product._id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
};

// Update quantity by delta (can be +1 or -1)
export const updateQuantity = (productId, delta) => {
  let cart = getCart();
  const index = cart.findIndex(p => p._id === productId);

  if (index !== -1) {
    cart[index].quantity += delta;

    if (cart[index].quantity <= 0) {
      cart.splice(index, 1); // remove item if quantity becomes 0
    }

    saveCart(cart);
  }
};

// Remove product entirely
export const removeFromCart = (productId) => {
  let cart = getCart();
  cart = cart.filter(p => p._id !== productId);
  saveCart(cart);
};

export const clearCart = () => {
  localStorage.removeItem('cart');
};