import Review from '../models/Review.js';

/**
 * Servicio de Gestión de Reseñas para Admin
 * Responsabilidad: Lógica de negocio para administración de reseñas
 * Principio SOLID: Single Responsibility - Solo maneja operaciones admin de reseñas
 */
class AdminReviewService {
  /**
   * Obtiene todas las reseñas con paginación y filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Object} Lista de reseñas paginada
   */
  async getAllReviews(filters = {}) {
    const {
      page = 1,
      limit = 10,
      rating,
      productId,
      userId,
      isActive,
      startDate,
      endDate
    } = filters;

    // Construir query de filtros
    const query = {};

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (productId) {
      query.product = productId;
    }

    if (userId) {
      query.user = userId;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true;
    }

    // Filtro por rango de fechas
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name email avatar')
        .populate('product', 'name price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments(query)
    ]);

    return {
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtiene una reseña por ID
   * @param {String} reviewId - ID de la reseña
   * @returns {Object} Reseña
   */
  async getReviewById(reviewId) {
    const review = await Review.findById(reviewId)
      .populate('user', 'name email avatar')
      .populate('product', 'name price images category')
      .lean();

    if (!review) {
      throw new Error('Reseña no encontrada');
    }

    return review;
  }

  /**
   * Actualiza el estado activo/inactivo de una reseña
   * @param {String} reviewId - ID de la reseña
   * @param {Boolean} isActive - Estado activo
   * @returns {Object} Reseña actualizada
   */
  async updateReviewStatus(reviewId, isActive) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('Reseña no encontrada');
    }

    review.isActive = isActive;
    await review.save();

    return await this.getReviewById(reviewId);
  }

  /**
   * Elimina una reseña
   * @param {String} reviewId - ID de la reseña
   * @returns {Object} Resultado de la eliminación
   */
  async deleteReview(reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('Reseña no encontrada');
    }

    await Review.findByIdAndDelete(reviewId);

    return {
      message: 'Reseña eliminada correctamente',
      reviewId
    };
  }

  /**
   * Obtiene estadísticas de reseñas
   * @returns {Object} Estadísticas
   */
  async getReviewStats() {
    const [
      totalReviews,
      activeReviews,
      reviewsByRating,
      averageRating
    ] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ isActive: true }),
      Review.aggregate([
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]),
      Review.aggregate([
        {
          $group: {
            _id: null,
            average: { $avg: '$rating' }
          }
        }
      ])
    ]);

    return {
      totalReviews,
      activeReviews,
      inactiveReviews: totalReviews - activeReviews,
      averageRating: averageRating[0]?.average || 0,
      reviewsByRating: reviewsByRating.reduce((acc, item) => {
        acc[`${item._id}_stars`] = item.count;
        return acc;
      }, {})
    };
  }

  /**
   * Obtiene reseñas recientes
   * @param {Number} limit - Cantidad de reseñas a obtener
   * @returns {Array} Reseñas recientes
   */
  async getRecentReviews(limit = 10) {
    return await Review.find()
      .populate('user', 'name email avatar')
      .populate('product', 'name price images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

export default new AdminReviewService();
