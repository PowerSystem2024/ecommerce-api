import userService from '../services/userService.js';
import { AppError } from '../utils/errorHandler.js';

/**
 * Controller para operaciones de usuarios (NO autenticación)
 * Autenticación ahora está en authController.js
 */
const userController = {
  async getProfile(req, res) {
    try {
      const user = await userService.getUserById(req.user.userId);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const user = await userService.updateUser(req.user.userId, req.body);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async getUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async promoteToAdmin(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Actualizar rol a admin
      user.role = 'admin';
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Usuario promovido a admin exitosamente',
        data: { userId: id, newRole: 'admin' }
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default userController;
