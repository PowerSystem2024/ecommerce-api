import userService from '../services/userService.js';

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
  }
};

export default userController;
