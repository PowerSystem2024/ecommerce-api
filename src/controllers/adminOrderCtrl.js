import adminOrderService from '../services/adminOrderService.js';

/**
 * Controlador de Gestión de Órdenes para Admin
 * Responsabilidad: Manejar peticiones HTTP de administración de órdenes
 * Principio SOLID: Single Responsibility - Solo maneja requests/responses
 */
const adminOrderController = {
  /**
   * GET /api/admin/orders
   * Lista todas las órdenes con paginación y filtros
   */
  async getAllOrders(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
        userId: req.query.userId,
        minAmount: req.query.minAmount,
        maxAmount: req.query.maxAmount,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await adminOrderService.getAllOrders(filters);

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener órdenes',
        error: error.message
      });
    }
  },

  /**
   * GET /api/admin/orders/:id
   * Obtiene una orden específica por ID
   */
  async getOrderById(req, res) {
    try {
      const order = await adminOrderService.getOrderById(req.params.id);

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      const statusCode = error.message === 'Orden no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * PUT /api/admin/orders/:id/status
   * Actualiza el estado de una orden
   */
  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'El campo "status" es requerido'
        });
      }

      const order = await adminOrderService.updateOrderStatus(req.params.id, status);

      res.json({
        success: true,
        message: 'Estado de orden actualizado correctamente',
        data: order
      });
    } catch (error) {
      const statusCode = error.message.includes('no encontrada') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * GET /api/admin/orders/stats
   * Obtiene estadísticas de órdenes
   */
  async getOrderStats(req, res) {
    try {
      const stats = await adminOrderService.getOrderStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas de órdenes',
        error: error.message
      });
    }
  },

  /**
   * GET /api/admin/orders/recent
   * Obtiene las órdenes más recientes
   */
  async getRecentOrders(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const orders = await adminOrderService.getRecentOrders(limit);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener órdenes recientes',
        error: error.message
      });
    }
  }
};

export default adminOrderController;
