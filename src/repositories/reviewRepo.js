import Review from '../models/Review.js';

class ReviewRepository {
  async create(reviewData) {
    return await Review.create(reviewData);
  }

  async findById(id) {
    return await Review.findById(id).populate('user', 'name email').populate('product', 'name');
  }

  async findAll({ filter = {}, skip = 0, limit = 10, sortOrder = -1 } = {}) {
    return await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit);
  }

  async findByProduct(productId, { skip = 0, limit = 10, sortOrder = -1 } = {}) {
    return await Review.find({ product: productId, isActive: true })
      .populate('user', 'name email')
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit);
  }

  async findByUser(userId, { skip = 0, limit = 10, sortOrder = -1 } = {}) {
    return await Review.find({ user: userId, isActive: true })
      .populate('product', 'name')
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit);
  }

  async findByProductAndUser(productId, userId) {
    return await Review.findOne({ product: productId, user: userId, isActive: true });
  }

  async update(id, updateData) {
    return await Review.findByIdAndUpdate(id, updateData, { new: true })
      .populate('user', 'name email')
      .populate('product', 'name');
  }

  async softDelete(id) {
    return await Review.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async countByProduct(productId) {
    return await Review.countDocuments({ product: productId, isActive: true });
  }

  async countByUser(userId) {
    return await Review.countDocuments({ user: userId, isActive: true });
  }

  async countAll(filter = {}) {
    return await Review.countDocuments(filter);
  }

  async getAverageRating(productId) {
    const result = await Review.aggregate([
      { $match: { product: productId, isActive: true } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);
    
    return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
  }

  async getRatingDistribution(productId) {
    return await Review.aggregate([
      { $match: { product: productId, isActive: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
  }
}

export default new ReviewRepository();
