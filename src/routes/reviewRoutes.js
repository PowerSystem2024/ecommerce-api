import express from 'express';
import reviewController from '../controllers/reviewCtrl.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.get('/product/:productId', reviewController.getReviewsByProduct);
router.get('/product/:productId/stats', reviewController.getProductRatingStats);

// Rutas que requieren autenticación
router.post('/', auth, reviewController.createReview);
router.get('/my-reviews', auth, reviewController.getReviewsByUser);
router.get('/:id', reviewController.getReview);
router.put('/:id', auth, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

// Ruta para administradores (opcional)
router.get('/', auth, reviewController.getAllReviews);

export default router;
