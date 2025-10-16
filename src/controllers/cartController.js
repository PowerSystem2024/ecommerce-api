// Importa el servicio del carrito para la lógica de negocio
import cartService from '../services/cartService.js';

// Controlador para obtener el carrito del usuario autenticado
export const getCart = async (req, res) => {
  try {
    // Llama al servicio para obtener el carrito
    const cart = await cartService.getCart(req.user.id);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controlador para agregar un producto al carrito
export const addToCart = async (req, res) => {
  try {
    // Recibe productId y quantity del body
    const { productId, quantity } = req.body;
    // Llama al servicio para agregar el producto
    const cart = await cartService.addToCart(req.user.id, productId, quantity);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controlador para quitar un producto del carrito
export const removeFromCart = async (req, res) => {
  try {
    // Recibe productId del body
    const { productId } = req.body;
    // Llama al servicio para quitar el producto
    const cart = await cartService.removeFromCart(req.user.id, productId);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controlador para vaciar el carrito del usuario
export const clearCart = async (req, res) => {
  try {
    // Llama al servicio para vaciar el carrito
    const cart = await cartService.clearUserCart(req.user.id);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
