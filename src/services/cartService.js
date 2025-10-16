// Importa el repositorio del carrito para acceder a la base de datos
import cartRepo from '../repositories/cartRepo.js';

// Obtiene el carrito del usuario
const getCart = async (userId) => {
  return await cartRepo.getCartByUserId(userId);
};

// Agrega un producto al carrito del usuario
const addToCart = async (userId, productId, quantity) => {
  return await cartRepo.addItemToCart(userId, productId, quantity);
};

// Elimina un producto del carrito del usuario
const removeFromCart = async (userId, productId) => {
  return await cartRepo.removeItemFromCart(userId, productId);
};

// Vacía el carrito del usuario
const clearUserCart = async (userId) => {
  return await cartRepo.clearCart(userId);
};

// Exporta las funciones del servicio para usarlas en el controlador
export default {
  getCart,
  addToCart,
  removeFromCart,
  clearUserCart
};
