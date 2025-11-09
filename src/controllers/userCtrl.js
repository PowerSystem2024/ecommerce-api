import userService from '../services/userService.js';
import { AppError } from '../utils/errorHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

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
  },

  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        throw new AppError('Por favor, sube una imagen válida', 400);
      }

      // Subir a Cloudinary
      const result = await uploadToCloudinary(req.file.buffer);

      // Obtener usuario actual
      const user = await userService.getUserById(req.user.userId);
      
      // Si ya tiene un avatar personalizado, eliminarlo de Cloudinary
      if (user.avatar && !user.avatar.includes('default-avatar')) {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`ecommerce/avatars/${publicId}`);
      }

      // Actualizar el avatar del usuario
      const updatedUser = await userService.updateUser(req.user.userId, { 
        avatar: result.secure_url 
      });

      res.json({
        success: true,
        data: {
          avatar: updatedUser.avatar
        }
      });

    } catch (error) {
      console.error('Error al subir el avatar:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al procesar la imagen'
      });
    }
  }
};

export default userController;