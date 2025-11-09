import express from 'express';
import mercadoPagoController from '../controllers/mercadoPagoCtrl.js';
import { validate } from '../utils/validator.js';
import mercadoPagoValidators from '../utils/mercadoPagoValidator.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas (webhook no requiere autenticación)
router.post('/webhook', mercadoPagoController.processWebhook);

// Páginas de redirección (no requieren autenticación)
router.get('/success', mercadoPagoController.success);
router.get('/failure', mercadoPagoController.failure);
router.get('/pending', mercadoPagoController.pending);

// Rutas protegidas (requieren autenticación)
// Pagos únicos
router.post('/payments', authenticateToken, validate(mercadoPagoValidators.createPayment), mercadoPagoController.createPayment);
router.get('/payments/:id', authenticateToken, mercadoPagoController.getPayment);

// Suscripciones
router.post('/subscriptions', authenticateToken, validate(mercadoPagoValidators.createSubscription), mercadoPagoController.createSubscription);
router.get('/subscriptions/:id', authenticateToken, mercadoPagoController.getSubscription);
router.delete('/subscriptions/:id', authenticateToken, mercadoPagoController.cancelSubscription);

// Usuario de MercadoPago
router.get('/user/me', mercadoPagoController.getCurrentUser);

export default router;

