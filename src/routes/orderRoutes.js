import express from 'express';
import orderController from '../controllers/orderCtrl.js';
import auth from '../middlewares/auth.js';
import { validators, validate } from '../utils/validator.js';

const router = express.Router();

// POST /api/orders - Crear orden desde datos directos
router.post('/', auth, validate(validators.createOrder), orderController.createOrder);

// POST /api/orders/from-cart - Crear orden desde carrito
router.post('/from-cart', auth, validate(validators.createOrderFromCart), orderController.createOrderFromCart);

// GET /api/orders - Ver órdenes (propias si es usuario, todas si es admin)
router.get('/', auth, orderController.getOrders);

// GET /api/orders/:id - Ver detalle de orden específica
router.get('/:id', auth, orderController.getOrder);

// PUT /api/orders/:id/status - Actualizar estado de orden
router.put('/:id/status', auth, validate(validators.updateOrderStatus), orderController.updateOrderStatus);

// POST /api/orders/:id/payment - Crear preferencia de pago
router.post('/:id/payment', auth, orderController.createPayment);

export default router;
