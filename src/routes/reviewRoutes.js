import express from 'express';
import reviewController from '../controllers/reviewCtrl.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.get('/product/:productId', reviewController.getReviewsByProduct);
router.get('/product/:productId/stats', reviewController.getProductRatingStats);

// Rutas que requieren autenticación
router.post('/', authenticateToken, reviewController.createReview);
router.get('/my-reviews', authenticateToken, reviewController.getReviewsByUser);
router.get('/reviewable-products', authenticateToken, reviewController.getReviewableProducts);
router.get('/:id', authenticateToken, reviewController.getReview);
router.put('/:id', authenticateToken, reviewController.updateReview);
router.delete('/:id', authenticateToken, reviewController.deleteReview);

// Ruta para administradores (opcional)
router.get('/', authenticateToken, isAdmin, reviewController.getAllReviews);

export default router;
