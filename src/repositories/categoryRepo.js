 import Category from '../models/Category.js';
import Product from '../models/Product.js';

class CategoryRepository {
  // Obtener todas las categorías
  async getAll() {
    return await Category.find({}).sort({ name: 1 });
  }

  // Crear nueva categoría
  async create(data) {
    const category = new Category(data);
    return await category.save();
  }

  // Obtener categoría por ID
  async getById(id) {
    return await Category.findById(id);
  }

  // Actualizar categoría
  async update(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  // Eliminar categoría
  async delete(id) {
    return await Category.findByIdAndDelete(id);
  }

  // Obtener productos por categoría
  async getProductsByCategory(categoryId) {
    return await Product.find({ category: categoryId, isActive: true })
      .populate('category', 'name description')
      .sort({ name: 1 });
  }

  // Buscar categorías por término
  async search(term) {
    return await Category.find({
      $or: [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } }
      ]
    }).sort({ name: 1 });
  }

  // Obtener estadísticas de categorías
  async getStats() {
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });

    const categoriesWithProducts = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          name: 1,
          productCount: 1
        }
      }
    ]);

    return {
      totalCategories,
      activeCategories,
      categoriesWithProducts
    };
  }
}

export default new CategoryRepository();
