// Importa el modelo Cart para interactuar con la base de datos
import Cart from '../models/Cart.js';

// Busca el carrito de un usuario y trae los productos con populate
const getCartByUserId = async (userId) => {
  return await Cart.findOne({ user: userId }).populate('items.product');
};

// Agrega un producto al carrito del usuario
const addItemToCart = async (userId, productId, quantity) => {
  // Busca el carrito del usuario
  let cart = await Cart.findOne({ user: userId });
  // Si no existe, lo crea
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }
  // Busca si el producto ya está en el carrito
  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  if (itemIndex > -1) {
    // Si existe, suma la cantidad
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Si no existe, lo agrega
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  return cart;
};

// Elimina un producto del carrito del usuario
const removeItemFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return null;
  // Filtra los productos para quitar el indicado
  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();
  return cart;
};

// Vacía el carrito del usuario
const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return null;
  cart.items = [];
  await cart.save();
  return cart;
};

// Exporta las funciones para usarlas en el servicio
export default {
  getCartByUserId,
  addItemToCart,
  removeItemFromCart,
  clearCart
};
