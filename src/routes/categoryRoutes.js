import express from 'express';
import { body } from 'express-validator';
import categoryController from '../controllers/categoryCtrl.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';
import { validate, validators } from '../utils/validator.js';

const router = express.Router();

// Middleware de validación para crear categoría
const validateCreateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres')
];

// Middleware de validación para actualizar categoría
const validateUpdateCategory = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres')
];

// Rutas públicas
router.get('/', categoryController.getAllCategories);
router.get('/search', categoryController.searchCategories);
router.get('/stats', authenticateToken, isAdmin, categoryController.getCategoryStats);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/products', categoryController.getProductsByCategory);

// Rutas protegidas (requieren autenticación y ser admin)
router.post('/', 
  authenticateToken, 
  isAdmin, 
  validateCreateCategory, 
  categoryController.createCategory
);

router.put('/:id', 
  authenticateToken, 
  isAdmin, 
  validateUpdateCategory, 
  categoryController.updateCategory
);

router.delete('/:id', 
  authenticateToken, 
  isAdmin, 
  categoryController.deleteCategory
);

export default router;
