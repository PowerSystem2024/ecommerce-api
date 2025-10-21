import Product from '../models/Product.js';
import Category from '../models/Category.js';

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

  // Búsqueda con paginación, orden y filtros avanzados
  async findWithFilters(query = {}, options = {}) {
    const { sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = options;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name description')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    return {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total
      }
    };
  }

  async update(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  async findByCategory(category) {
    return await Product.find({ category, isActive: true });
  }

  async findAllCategories() {
    return await Category.find({ isActive: true }).select('name');
  }

  async updateStock(id, newStock) {
    return await Product.findByIdAndUpdate(
      id,
      { stock: newStock },
      { new: true }
    );
  }
}

export default new ProductRepository();
