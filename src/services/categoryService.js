import Category from '../models/Category.js';
import Product from '../models/Product.js';

class CategoryService {
  // Obtener todas las categorías
  async getAllCategories() {
    try {
      const categories = await Category.find({
        $or: [
          { isActive: { $exists: false } },
          { isActive: true }
        ]
      })
        .sort({ name: 1 });
      
      return {
        success: true,
        data: categories,
        message: 'Categorías obtenidas exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }
  }

  // Obtener categoría por ID
  async getCategoryById(id) {
    try {
      const category = await Category.findById(id);
      
      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      return {
        success: true,
        data: category,
        message: 'Categoría obtenida exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al obtener categoría: ${error.message}`);
    }
  }

  // Crear nueva categoría
  async createCategory(categoryData) {
    try {
      const { name, description } = categoryData;

      // Verificar si ya existe una categoría con el mismo nombre
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
      });

      if (existingCategory) {
        throw new Error('Ya existe una categoría con este nombre');
      }

      const newCategory = new Category({
        name: name.trim(),
        description: description?.trim() || '',
        isActive: true
      });

      const savedCategory = await newCategory.save();

      return {
        success: true,
        data: savedCategory,
        message: 'Categoría creada exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al crear categoría: ${error.message}`);
    }
  }

  // Actualizar categoría
  async updateCategory(id, updateData) {
    try {
      const { name, description } = updateData;

      // Verificar si la categoría existe
      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        throw new Error('Categoría no encontrada');
      }

      // Si se está cambiando el nombre, verificar que no exista otra categoría con ese nombre
      if (name && name !== existingCategory.name) {
        const duplicateCategory = await Category.findOne({ 
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          _id: { $ne: id }
        });

        if (duplicateCategory) {
          throw new Error('Ya existe una categoría con este nombre');
        }
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        {
          name: name?.trim() || existingCategory.name,
          description: description?.trim() || existingCategory.description
        },
        { new: true, runValidators: true }
      );

      return {
        success: true,
        data: updatedCategory,
        message: 'Categoría actualizada exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al actualizar categoría: ${error.message}`);
    }
  }

  // Eliminar categoría (soft delete)
  async deleteCategory(id) {
    try {
      // Verificar si la categoría existe
      const category = await Category.findById(id);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      // Verificar si hay productos asociados a esta categoría
      const productsCount = await Product.countDocuments({ 
        category: id, 
        isActive: true 
      });

      if (productsCount > 0) {
        throw new Error(`No se puede eliminar la categoría porque tiene ${productsCount} producto(s) asociado(s)`);
      }

      // Soft delete - marcar como inactiva
      const deletedCategory = await Category.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      return {
        success: true,
        data: deletedCategory,
        message: 'Categoría eliminada exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
  }

  // Obtener productos por categoría
  async getProductsByCategory(categoryId, options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = options;

      // Verificar si la categoría existe
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      // Configurar paginación
      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Obtener productos con paginación
      const products = await Product.find({ 
        category: categoryId, 
        isActive: true 
      })
        .populate('category', 'name description')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      // Contar total de productos
      const totalProducts = await Product.countDocuments({ 
        category: categoryId, 
        isActive: true 
      });

      const totalPages = Math.ceil(totalProducts / limit);

      return {
        success: true,
        data: {
          category,
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalProducts,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        message: 'Productos por categoría obtenidos exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al obtener productos por categoría: ${error.message}`);
    }
  }

  // Obtener estadísticas de categorías
  async getCategoryStats() {
    try {
      const stats = await Category.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products'
          }
        },
        {
          $project: {
            name: 1,
            description: 1,
            productCount: { $size: '$products' },
            isActive: 1,
            createdAt: 1
          }
        },
        {
          $sort: { productCount: -1 }
        }
      ]);

      return {
        success: true,
        data: stats,
        message: 'Estadísticas de categorías obtenidas exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  // Buscar categorías por nombre
  async searchCategories(searchTerm) {
    try {
      const categories = await Category.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
              { description: { $regex: searchTerm, $options: 'i' } }
            ]
          }
        ]
      }).sort({ name: 1 });

      return {
        success: true,
        data: categories,
        message: 'Búsqueda de categorías completada exitosamente'
      };
    } catch (error) {
      throw new Error(`Error en búsqueda de categorías: ${error.message}`);
    }
  }
}

export default new CategoryService();
