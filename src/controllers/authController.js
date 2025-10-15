import { validationResult } from 'express-validator';
import authService from '../services/authService.js';
import { AppError } from '../utils/errorHandler.js';

/**
 * Controller dedicado para operaciones de autenticación
 * Responsabilidad: Manejar requests HTTP de registro y login
 */
const authController = {
  /**
   * Registrar nuevo usuario
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      // Validar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Datos de entrada no válidos', 400, errors.array());
      }

      const { name, email, password, passwordConfirm } = req.body;

      const result = await authService.signup({
        name,
        email,
        password,
        passwordConfirm
      });

      res.status(201).json({
        status: 'success',
        message: result.message,
        data: {
          user: result.data.user
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Iniciar sesión
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      // Validar datos de entrada
      if (!req.body.email || !req.body.password) {
        throw new AppError('Por favor, proporciona correo electrónico y contraseña', 400);
      }

      const result = await authService.login(req.body.email, req.body.password);

      // Crear cookie segura
      res.cookie('jwt', result.token, {
        expires: new Date(
          Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });

      // Eliminar la contraseña del output
      result.data.user.password = undefined;

      res.status(200).json({
        status: 'success',
        token: result.token,
        data: {
          user: result.data.user
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cerrar sesión
   * GET /api/auth/logout
   */
  logout(req, res) {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      status: 'success',
      message: 'Sesión cerrada correctamente'
    });
  },

  /**
   * Olvidé mi contraseña
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError('Por favor, proporciona un correo electrónico', 400);
      }

      await authService.forgotPassword(email);

      res.status(200).json({
        status: 'success',
        message: 'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Restablecer contraseña
   * PATCH /api/auth/reset-password/:token
   */
  async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { password, passwordConfirm } = req.body;

      if (!token) {
        throw new AppError('Token no proporcionado', 400);
      }

      const result = await authService.resetPassword(token, password, passwordConfirm);

      // Iniciar sesión al usuario, enviar JWT
      res.status(200).json({
        status: 'success',
        message: 'Contraseña actualizada correctamente',
        token: result.token,
        data: {
          user: result.data.user
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verificar token de restablecimiento
   * GET /api/auth/reset-password/:token
   */
  async verifyResetToken(req, res, next) {
    try {
      const { token } = req.params;

      if (!token) {
        throw new AppError('Token no proporcionado', 400);
      }

      await authService.verifyResetToken(token);

      res.status(200).json({
        status: 'success',
        message: 'Token válido',
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verificar correo electrónico
   * GET /api/auth/verify-email/:token
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;

      if (!token) {
        throw new AppError('Token no proporcionado', 400);
      }

      const result = await authService.verifyEmail(token);

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reenviar correo de verificación
   * POST /api/auth/resend-verification
   */
  async resendVerificationEmail(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError('Por favor, proporciona un correo electrónico', 400);
      }

      const result = await authService.resendVerificationEmail(email);

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * @desc    Probar conexión de email (para desarrollo)
   * @route   GET /api/auth/test-email
   * @access  Public
   */
  async testEmail(req, res, next) {
    try {
      const { testEmailConnection } = await import('../utils/emailService.js');
      const isConnected = await testEmailConnection();

      if (isConnected) {
        res.status(200).json({
          status: 'success',
          message: 'Conexión de email funcionando correctamente',
          data: { connected: true }
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Error en conexión de email',
          data: { connected: false }
        });
      }
    } catch (error) {
      next(error);
    }
  }
};

export default authController;
