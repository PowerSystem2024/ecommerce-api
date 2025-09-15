import express from 'express';
import userController from '../controllers/userCtrl.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/', userController.getUsers);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

export default router;
