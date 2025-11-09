import express from 'express';
import cartController from '../controllers/cartCtrl.js';
import auth from '../middlewares/auth.js';
import { validators, validate } from '../utils/validator.js';

const router = express.Router();

// GET /api/cart - Obtener carrito del usuario
router.get('/', auth, cartController.getCart);

// POST /api/cart/add - Agregar producto al carrito
router.post('/add', auth, validate(validators.addToCart), cartController.addToCart);

// PUT /api/cart/update - Actualizar cantidad de producto en carrito (body: productId, quantity)
router.put('/update', auth, validate(validators.updateCartItem), cartController.updateItemQuantity);

// DELETE /api/cart/remove/:productId - Remover producto del carrito
router.delete('/remove/:productId', auth, cartController.removeFromCart);

// DELETE /api/cart - Vaciar carrito
router.delete('/', auth, cartController.clearCart);

export default router;
