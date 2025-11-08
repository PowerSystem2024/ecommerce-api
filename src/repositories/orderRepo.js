import Order from '../models/Order.js';

class OrderRepository {
  async create(orderData) {
    return await Order.create(orderData);
  }

  async findById(id) {
    return await Order.findById(id)
      .populate('user', 'name email')
      .populate({
        path: 'products.product',
        select: 'name description images price sku'
      });
  }

  async findByUserId(userId) {
    return await Order.find({ user: userId })
      .populate({
        path: 'products.product',
        select: 'name description images price sku'
      })
      .sort({ createdAt: -1 });
  }

  async findAll() {
    return await Order.find()
      .populate('user', 'name email')
      .populate({
        path: 'products.product',
        select: 'name description images price sku'
      })
      .sort({ createdAt: -1 });
  }

  async update(id, updateData) {
    return await Order.findByIdAndUpdate(id, updateData, { new: true })
      .populate('user', 'name email')
      .populate({
        path: 'products.product',
        select: 'name description images price sku'
      });
  }

  async updateStatus(id, status) {
    return await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate('user', 'name email')
      .populate({
        path: 'products.product',
        select: 'name description images price sku'
      });
  }

  async findByPaymentId(paymentId) {
    return await Order.findOne({ paymentId });
  }

  async hasUserPurchasedProduct(userId, productId) {
    const purchaseStatuses = ['confirmada', 'enviada', 'entregada'];

    return await Order.exists({
      user: userId,
      'products.product': productId,
      status: { $in: purchaseStatuses }
    });
  }
}

export default new OrderRepository();

