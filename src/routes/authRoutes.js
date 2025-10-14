import express from 'express';
import authController from '../controllers/authController.js';
import { validators, validate } from '../utils/validator.js';

const router = express.Router();

// POST /api/auth/register - Registro de nuevos usuarios
router.post('/register', validate(validators.registerUser), authController.register);

// POST /api/auth/login - Inicio de sesión
router.post('/login', validate(validators.loginUser), authController.login);

// GET /api/auth/logout - Cerrar sesión
router.get('/logout', authController.logout);

// POST /api/auth/forgot-password - Solicitar recuperación de contraseña
router.post('/forgot-password', authController.forgotPassword);

// PATCH /api/auth/reset-password/:token - Restablecer contraseña con token
router.patch('/reset-password/:token', authController.resetPassword);

// GET /api/auth/reset-password/:token - Verificar token de restablecimiento
router.get('/reset-password/:token', authController.verifyResetToken);

// GET /api/auth/verify-email/:token - Verificar correo electrónico
router.get('/verify-email/:token', authController.verifyEmail);

// POST /api/auth/resend-verification - Reenviar correo de verificación
router.post('/resend-verification', authController.resendVerificationEmail);

export default router;
