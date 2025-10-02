import express from 'express';
import authController from '../controllers/authController.js';
import { validators, validate } from '../utils/validator.js';

const router = express.Router();

// POST /api/auth/register - Registro de nuevos usuarios
router.post('/register', validate(validators.registerUser), authController.register);

// POST /api/auth/login - Inicio de sesión
router.post('/login', validate(validators.loginUser), authController.login);

export default router;
