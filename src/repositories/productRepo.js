import Product from '../models/Product.js';

class ProductRepository {
  async create(productData) {
    return await Product.create(productData);
  }

  async findById(id) {
    return await Product.findById(id);
  }

  async findAll(filters = {}) {
    const query = { isActive: true }; // Solo productos activos por defecto
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' }; // Búsqueda case-insensitive
    }
    
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        query.price.$lte = filters.maxPrice;
      }
    }
    
    return await Product.find(query);
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

  async findAllCategories() {
    return await Category.find({ isActive: true }).select('name');
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
