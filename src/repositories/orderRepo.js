import Order from '../models/Order.js';

class OrderRepository {
  async create(orderData) {
    return await Order.create(orderData);
  }

  async findById(id) {
    return await Order.findById(id).populate('user products.product');
  }

  async findByUserId(userId) {
    return await Order.find({ user: userId }).populate('products.product');
  }

  async findAll() {
    return await Order.find().populate('user products.product');
  }

  async update(id, updateData) {
    return await Order.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateStatus(id, status) {
    return await Order.findByIdAndUpdate(id, { status }, { new: true });
  }

  async findByPaymentId(paymentId) {
    return await Order.findOne({ paymentId });
  }
}

export default new OrderRepository();
