import Product from '../models/Product.js';

class ProductRepository {
  async create(productData) {
    return await Product.create(productData);
  }

  async findById(id) {
    return await Product.findById(id);
  }

  async findAll(filters = {}) {
    return await Product.find(filters);
  }

  async update(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }

  async findByCategory(category) {
    return await Product.find({ category, isActive: true });
  }

  async updateStock(id, quantity) {
    return await Product.findByIdAndUpdate(
      id, 
      { $inc: { stock: -quantity } }, 
      { new: true }
    );
  }
}

export default new ProductRepository();
