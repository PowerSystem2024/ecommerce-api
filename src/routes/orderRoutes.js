import express from 'express';
import orderController from '../controllers/orderCtrl.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrder);
router.post('/:id/payment', auth, orderController.createPayment);

export default router;
