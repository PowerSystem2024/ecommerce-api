import express from 'express';
import userController from '../controllers/userCtrl.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';
import { upload, handleMulterError } from '../middlewares/upload.js';
const router = express.Router();

// Rutas protegidas - requieren autenticación
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.post(
  '/upload-avatar',
  authenticateToken,
  upload.single('avatar'),
  handleMulterError,
  userController.uploadAvatar
);
// Rutas administrativas (requieren autenticación y rol admin)
// router.get('/', authenticateToken, userController.getUsers);
// router.post('/:id/promote', authenticateToken, isAdmin, userController.promoteToAdmin);

export default router;
