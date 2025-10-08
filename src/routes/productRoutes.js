import express from 'express';
import productController from '../controllers/productCtrl.js';
import auth from '../middlewares/auth.js';
import { validate, validators } from '../utils/validator.js';

const router = express.Router();

// Aplicar validación a POST y PUT
router.post('/', auth, validate(validators.createProduct), productController.createProduct);
router.put('/:id', auth, validate(validators.createProduct), productController.updateProduct);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.delete('/:id', auth, productController.deleteProduct);

export default router;
