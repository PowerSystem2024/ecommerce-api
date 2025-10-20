import express from 'express';
import productController from '../controllers/productCtrl.js';
import reviewController from '../controllers/reviewCtrl.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';
import { validate, validators } from '../utils/validator.js';

const router = express.Router();

// Aplicar validación a POST y PUT
router.post('/', authenticateToken, isAdmin, validate(validators.createProduct), productController.createProduct);
router.put('/:id', authenticateToken, isAdmin, validate(validators.createProduct), productController.updateProduct);

router.get('/', productController.getProducts);
router.get('/:productId/reviews', reviewController.getReviewsByProduct);
router.get('/:id', productController.getProduct);
router.delete('/:id', authenticateToken, isAdmin, productController.deleteProduct);

export default router;
