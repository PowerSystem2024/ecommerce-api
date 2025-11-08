import reviewService from '../services/reviewService.js';

const reviewController = {
  async createReview(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { productId, ...payload } = req.body;
      const reviewData = {
        ...payload,
        product: req.body.product || productId,
        user: userId // El usuario viene del middleware de autenticación
      };

      if (!reviewData.product) {
        throw new Error('Producto requerido para crear reseña');
      }
      
      const { review, ratingSummary } = await reviewService.createReview(reviewData);
      res.status(201).json({
        success: true,
        data: review,
        meta: ratingSummary,
        message: 'Reseña creada exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async getReviewsByProduct(req, res) {
    try {
      const result = await reviewService.getReviewsByProduct(req.params.productId, req.query);
      res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async getReviewsByUser(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const result = await reviewService.getReviewsByUser(userId, req.query);
      res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getReview(req, res) {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateReview(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const review = await reviewService.updateReview(
        req.params.id, 
        req.body, 
        userId
      );
      res.json({
        success: true,
        data: review.review,
        meta: review.ratingSummary,
        message: 'Reseña actualizada exitosamente'
      });
    } catch (error) {
      const statusCode = error.message.includes('No tienes permisos') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  async deleteReview(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const isAdmin = req.user.role === 'admin';
      const result = await reviewService.deleteReview(req.params.id, userId, isAdmin);
      res.json({
        success: true,
        meta: result.ratingSummary,
        message: 'Reseña eliminada exitosamente'
      });
    } catch (error) {
      const statusCode = error.message.includes('No tienes permisos') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  },

  async getProductRatingStats(req, res) {
    try {
      const stats = await reviewService.getProductRatingStats(req.params.productId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async getAllReviews(req, res) {
    try {
      const result = await reviewService.getAllReviews(req.query);
      res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default reviewController;
