import userService from '../services/userService.js';

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
      const { name, email, password } = req.body;
      
      const result = await userService.registerUser({ name, email, password });
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: result.user,
          token: result.token
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
      const { email, password } = req.body;
      
      const result = await userService.loginUser(email, password);
      
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default authController;
