// Importa express y los controladores del carrito
import express from 'express';
import { getCart, addToCart, removeFromCart, clearCart } from '../controllers/cartController.js';
import auth from '../middlewares/auth.js';

// Crea el router para las rutas del carrito
const router = express.Router();

// Ruta para obtener el carrito del usuario autenticado
router.get('/', auth, getCart);
// Ruta para agregar un producto al carrito
router.post('/add', auth, addToCart);
// Ruta para quitar un producto del carrito
router.post('/remove', auth, removeFromCart);
// Ruta para vaciar el carrito
router.post('/clear', auth, clearCart);

// Exporta el router para usarlo en el router principal
export default router;
