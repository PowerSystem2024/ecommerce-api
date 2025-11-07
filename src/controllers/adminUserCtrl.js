import adminUserService from '../services/adminUserService.js';

/**
 * Controlador de Gestión de Usuarios para Admin
 * Responsabilidad: Manejar peticiones HTTP de administración de usuarios
 * Principio SOLID: Single Responsibility - Solo maneja requests/responses
 */
const adminUserController = {
  /**
   * GET /api/admin/users
   * Lista todos los usuarios con paginación y filtros
   */
  async getAllUsers(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        role: req.query.role,
        isActive: req.query.isActive,
        search: req.query.search
      };

      const result = await adminUserService.getAllUsers(filters);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios',
        error: error.message
      });
    }
  },

  /**
   * GET /api/admin/users/:id
   * Obtiene un usuario específico por ID
   */
  async getUserById(req, res) {
    try {
      const user = await adminUserService.getUserById(req.params.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * PUT /api/admin/users/:id/role
   * Actualiza el rol de un usuario
   */
  async updateUserRole(req, res) {
    try {
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'El campo "role" es requerido'
        });
      }

      const user = await adminUserService.updateUserRole(req.params.id, role);

      res.json({
        success: true,
        message: 'Rol actualizado correctamente',
        data: user
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * PUT /api/admin/users/:id/status
   * Actualiza el estado activo/inactivo de un usuario
   */
  async updateUserStatus(req, res) {
    try {
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({
          success: false,
          message: 'El campo "isActive" es requerido'
        });
      }

      const user = await adminUserService.updateUserStatus(req.params.id, isActive);

      res.json({
        success: true,
        message: 'Estado actualizado correctamente',
        data: user
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * PUT /api/admin/users/:id
   * Actualiza información completa de un usuario
   */
  async updateUser(req, res) {
    try {
      const { name, email, phone, address } = req.body;
      
      const user = await adminUserService.updateUser(req.params.id, {
        name,
        email,
        phone,
        address
      });

      res.json({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: user
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * DELETE /api/admin/users/:id
   * Eliminación lógica de un usuario
   */
  async deleteUser(req, res) {
    try {
      const result = await adminUserService.deleteUser(req.params.id);

      res.json({
        success: true,
        message: result.message,
        data: { userId: result.userId }
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * POST /api/admin/users/:id/restore
   * Restaurar un usuario eliminado
   */
  async restoreUser(req, res) {
    try {
      const user = await adminUserService.restoreUser(req.params.id);

      res.json({
        success: true,
        message: 'Usuario restaurado correctamente',
        data: user
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * GET /api/admin/users/deleted
   * Lista usuarios eliminados
   */
  async getDeletedUsers(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search
      };

      const result = await adminUserService.getDeletedUsers(filters);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios eliminados',
        error: error.message
      });
    }
  },

  /**
   * GET /api/admin/users/stats
   * Obtiene estadísticas de usuarios
   */
  async getUserStats(req, res) {
    try {
      const stats = await adminUserService.getUserStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas de usuarios',
        error: error.message
      });
    }
  }
};

export default adminUserController;
