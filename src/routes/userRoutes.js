import express from 'express';
import userController from '../controllers/userCtrl.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Rutas protegidas - requieren autenticación
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

// Rutas administrativas (podrían requerir rol admin)
router.get('/', auth, userController.getUsers);

export default router;
