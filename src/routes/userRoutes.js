import express from 'express';
import userController from '../controllers/userCtrl.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Rutas protegidas - requieren autenticación
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

// Rutas administrativas (requieren autenticación y rol admin)
// router.get('/', authenticateToken, userController.getUsers);
// router.post('/:id/promote', authenticateToken, isAdmin, userController.promoteToAdmin);

export default router;
