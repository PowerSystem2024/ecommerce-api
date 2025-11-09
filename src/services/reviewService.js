import reviewRepo from '../repositories/reviewRepo.js';
import productRepo from '../repositories/productRepo.js';
import orderRepo from '../repositories/orderRepo.js';

const normalizePagination = (options = {}) => {
  const page = Number(options.page) && Number(options.page) > 0 ? Number(options.page) : 1;
  const limit = Number(options.limit) && Number(options.limit) > 0 ? Math.min(Number(options.limit), 100) : 10;
  const sort = typeof options.sort === 'string' && options.sort.toLowerCase() === 'asc' ? 1 : -1;

  return {
    page,
    limit,
    sortOrder: sort,
    skip: (page - 1) * limit
  };
};

class ReviewService {
  async updateProductRating(productId) {
    const averageData = await reviewRepo.getAverageRating(productId);
    const totalReviews = await reviewRepo.countByProduct(productId);
    const averageRating = averageData.averageRating ? Math.round(averageData.averageRating * 10) / 10 : 0;

    await productRepo.update(productId, {
      averageRating,
      reviewsCount: totalReviews
    });

    return {
      averageRating,
      totalReviews
    };
  }

  async createReview(reviewData) {
    // Validar que el producto existe
    const product = await productRepo.findById(reviewData.product);
    if (!product || !product.isActive) {
      throw new Error('Producto no disponible para reseñas');
    }

    // Verificar si el usuario ya tiene una review para este producto
    const existingReview = await reviewRepo.findByProductAndUser(reviewData.product, reviewData.user);
    if (existingReview) {
      throw new Error('Ya has valorado este producto');
    }

    // Validar que el usuario haya comprado el producto
    const hasPurchased = await orderRepo.hasUserPurchasedProduct(reviewData.user, reviewData.product);
    if (!hasPurchased) {
      throw new Error('Solo puedes reseñar productos que has comprado');
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

    const createdReview = await reviewRepo.create(reviewData);
    const populatedReview = await reviewRepo.findById(createdReview._id);
    const ratingSummary = await this.updateProductRating(reviewData.product);

    return {
      review: populatedReview,
      ratingSummary
    };
  }

  async getReviewById(id) {
    const review = await reviewRepo.findById(id);
    if (!review) {
      throw new Error('Reseña no encontrada');
    }
    return review;
  }

  async getReviewsByProduct(productId, options = {}) {
    // Validar que el producto existe
    const product = await productRepo.findById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const { page, limit, sortOrder, skip } = normalizePagination(options);
    const reviews = await reviewRepo.findByProduct(productId, { skip, limit, sortOrder });
    const total = await reviewRepo.countByProduct(productId);

    return {
      reviews,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
        totalReviews: total
      }
    };
  }

  async getReviewsByUser(userId, options = {}) {
    const { page, limit, sortOrder, skip } = normalizePagination(options);
    const reviews = await reviewRepo.findByUser(userId, { skip, limit, sortOrder });
    const total = await reviewRepo.countByUser(userId);

    return {
      reviews,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
        totalReviews: total
      }
    };
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

    const updatedReview = await reviewRepo.update(id, updateData);
    const ratingSummary = await this.updateProductRating(review.product._id);

    return {
      review: updatedReview,
      ratingSummary
    };
  }

  async deleteReview(id, userId, isAdmin = false) {
    const review = await this.getReviewById(id);
    
    // Verificar permisos: el usuario es el autor o es admin
    if (review.user._id.toString() !== userId && !isAdmin) {
      throw new Error('No tienes permisos para eliminar esta reseña');
    }

    if (!review.isActive) {
      throw new Error('La reseña ya se encuentra inactiva');
    }

    await reviewRepo.softDelete(id);
    const ratingSummary = await this.updateProductRating(review.product._id);

    return {
      ratingSummary
    };
  }

  async getProductRatingStats(productId) {
    // Validar que el producto existe
    const product = await productRepo.findById(productId);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const ratingSummary = await this.updateProductRating(productId);
    const ratingDistribution = await reviewRepo.getRatingDistribution(productId);

    return {
      averageRating: ratingSummary.averageRating,
      totalReviews: ratingSummary.totalReviews,
      ratingDistribution
    };
  }

  async getAllReviews(filters = {}) {
    const { page, limit, sortOrder, skip } = normalizePagination(filters);
    const filter = {};

    if (!filters.includeInactive) {
      filter.isActive = true;
    }

    if (filters.product) {
      filter.product = filters.product;
    }

    if (filters.user) {
      filter.user = filters.user;
    }

    if (filters.rating) {
      filter.rating = Number(filters.rating);
    }

    const reviews = await reviewRepo.findAll({ filter, skip, limit, sortOrder });
    const total = await reviewRepo.countAll(filter);

    return {
      reviews,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
        totalReviews: total
      }
    };
  }
}

export default new ReviewService();
