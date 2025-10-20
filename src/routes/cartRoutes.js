import express from 'express';
import cartController from '../controllers/cartCtrl.js';
import auth from '../middlewares/auth.js';
import { validators, validate } from '../utils/validator.js';

const router = express.Router();

// GET /api/cart - Obtener carrito del usuario
router.get('/', auth, cartController.getCart);

// POST /api/cart/items - Agregar producto al carrito
router.post('/items', auth, validate(validators.addToCart), cartController.addToCart);

// PUT /api/cart/items/:productId - Actualizar cantidad de producto en carrito
router.put('/items/:productId', auth, validate(validators.updateCartItem), cartController.updateItemQuantity);

// DELETE /api/cart/items/:productId - Remover producto del carrito
router.delete('/items/:productId', auth, cartController.removeFromCart);

// DELETE /api/cart - Vaciar carrito
router.delete('/', auth, cartController.clearCart);

export default router;
