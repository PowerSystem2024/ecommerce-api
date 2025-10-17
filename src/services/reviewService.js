import reviewRepo from '../repositories/reviewRepo.js';
import productRepo from '../repositories/productRepo.js';

class ReviewService {
  async createReview(reviewData) {
    // Validar que el producto existe
    const product = await productRepo.findById(reviewData.product);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // Verificar si el usuario ya tiene una review para este producto
    const existingReview = await reviewRepo.findByProductAndUser(reviewData.product, reviewData.user);
    if (existingReview) {
      throw new Error('Ya has valorado este producto');
    }

    // Validaciones de negocio
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('La valoración debe estar entre 1 y 5');
    }

    if (!reviewData.comment || reviewData.comment.trim().length === 0) {
      throw new Error('El comentario es requerido');
    }

    if (reviewData.comment.length > 500) {
      throw new Error('El comentario no puede exceder 500 caracteres');
    }

    return await reviewRepo.create(reviewData);
  }

  async getReviewById(id) {
    const review = await reviewRepo.findById(id);
    if (!review) {
      throw new Error('Reseña no encontrada');
    }
    return review;
  }

  async getReviewsByProduct(productId) {
    // Validar que el producto existe
    const product = await productRepo.findById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    return await reviewRepo.findByProduct(productId);
  }

  async getReviewsByUser(userId) {
    return await reviewRepo.findByUser(userId);
  }

  async updateReview(id, updateData, userId) {
    const review = await this.getReviewById(id);
    
    // Verificar que el usuario es el autor de la review
    if (review.user._id.toString() !== userId) {
      throw new Error('No tienes permisos para editar esta reseña');
    }

    // Validaciones de actualización
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      throw new Error('La valoración debe estar entre 1 y 5');
    }

    if (updateData.comment && updateData.comment.length > 500) {
      throw new Error('El comentario no puede exceder 500 caracteres');
    }

    return await reviewRepo.update(id, updateData);
  }

  async deleteReview(id, userId, isAdmin = false) {
    const review = await this.getReviewById(id);
    
    // Verificar permisos: el usuario es el autor o es admin
    if (review.user._id.toString() !== userId && !isAdmin) {
      throw new Error('No tienes permisos para eliminar esta reseña');
    }

    return await reviewRepo.softDelete(id);
  }

  async getProductRatingStats(productId) {
    // Validar que el producto existe
    const product = await productRepo.findById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const [averageRating, ratingDistribution] = await Promise.all([
      reviewRepo.getAverageRating(productId),
      reviewRepo.getRatingDistribution(productId)
    ]);

    return {
      averageRating: Math.round(averageRating.averageRating * 10) / 10, // Redondear a 1 decimal
      totalReviews: averageRating.totalReviews,
      ratingDistribution: ratingDistribution
    };
  }

  async getAllReviews(filters = {}) {
    return await reviewRepo.findAll(filters);
  }
}

export default new ReviewService();
