import adminReviewService from '../services/adminReviewService.js';

/**
 * Controlador de Gestión de Reseñas para Admin
 * Responsabilidad: Manejar peticiones HTTP de administración de reseñas
 * Principio SOLID: Single Responsibility - Solo maneja requests/responses
 */
const adminReviewController = {
  /**
   * GET /api/admin/reviews
   * Lista todas las reseñas con paginación y filtros
   */
  async getAllReviews(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        rating: req.query.rating,
        productId: req.query.productId,
        userId: req.query.userId,
        isActive: req.query.isActive,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await adminReviewService.getAllReviews(filters);

      res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener reseñas',
        error: error.message
      });
    }
  },

  /**
   * GET /api/admin/reviews/:id
   * Obtiene una reseña específica por ID
   */
  async getReviewById(req, res) {
    try {
      const review = await adminReviewService.getReviewById(req.params.id);

      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      const statusCode = error.message === 'Reseña no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * PUT /api/admin/reviews/:id/status
   * Actualiza el estado activo/inactivo de una reseña
   */
  async updateReviewStatus(req, res) {
    try {
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({
          success: false,
          message: 'El campo "isActive" es requerido'
        });
      }

      const review = await adminReviewService.updateReviewStatus(req.params.id, isActive);

      res.json({
        success: true,
        message: 'Estado de reseña actualizado correctamente',
        data: review
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
   * DELETE /api/admin/reviews/:id
   * Elimina una reseña
   */
  async deleteReview(req, res) {
    try {
      const result = await adminReviewService.deleteReview(req.params.id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      const statusCode = error.message === 'Reseña no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * GET /api/admin/reviews/stats
   * Obtiene estadísticas de reseñas
   */
  async getReviewStats(req, res) {
    try {
      const stats = await adminReviewService.getReviewStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas de reseñas',
        error: error.message
      });
    }
  },

  /**
   * GET /api/admin/reviews/recent
   * Obtiene las reseñas más recientes
   */
  async getRecentReviews(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const reviews = await adminReviewService.getRecentReviews(limit);

      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener reseñas recientes',
        error: error.message
      });
    }
  }
};

export default adminReviewController;
