import reviewService from '../services/reviewService.js';

const reviewController = {
  async createReview(req, res) {
    try {
      const reviewData = {
        ...req.body,
        user: req.user.id // El usuario viene del middleware de autenticación
      };
      
      const review = await reviewService.createReview(reviewData);
      res.status(201).json({
        success: true,
        data: review,
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
      const reviews = await reviewService.getReviewsByProduct(req.params.productId);
      res.json({
        success: true,
        data: reviews
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
      const reviews = await reviewService.getReviewsByUser(req.user.id);
      res.json({
        success: true,
        data: reviews
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
      const review = await reviewService.updateReview(
        req.params.id, 
        req.body, 
        req.user.id
      );
      res.json({
        success: true,
        data: review,
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
      const isAdmin = req.user.role === 'admin';
      await reviewService.deleteReview(req.params.id, req.user.id, isAdmin);
      res.json({
        success: true,
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
      const reviews = await reviewService.getAllReviews(req.query);
      res.json({
        success: true,
        data: reviews
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
