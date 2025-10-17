import categoryService from '../services/categoryService.js';
import { validationResult } from 'express-validator';

class CategoryController {
  // GET /api/categories - Listar todas las categorías
  async getAllCategories(req, res) {
    try {
      const result = await categoryService.getAllCategories();
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        count: result.data.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/categories/:id - Obtener categoría por ID
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
      }

      const result = await categoryService.getCategoryById(id);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // POST /api/categories - Crear nueva categoría (admin)
  async createCategory(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { name, description } = req.body;

      const result = await categoryService.createCategory({ name, description });
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      if (error.message.includes('Ya existe una categoría')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // PUT /api/categories/:id - Actualizar categoría (admin)
  async updateCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
      }

      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { name, description } = req.body;

      const result = await categoryService.updateCategory(id, { name, description });
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Ya existe una categoría')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // DELETE /api/categories/:id - Eliminar categoría (admin)
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
      }

      const result = await categoryService.deleteCategory(id);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('No se puede eliminar')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/categories/:id/products - Obtener productos por categoría
  async getProductsByCategory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
      }

      // Validar parámetros de paginación
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros de paginación inválidos'
        });
      }

      const options = {
        page: pageNum,
        limit: limitNum,
        sortBy,
        sortOrder
      };

      const result = await categoryService.getProductsByCategory(id, options);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/categories/stats - Obtener estadísticas de categorías (admin)
  async getCategoryStats(req, res) {
    try {
      const result = await categoryService.getCategoryStats();
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/categories/search?q=term - Buscar categorías
  async searchCategories(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'El término de búsqueda debe tener al menos 2 caracteres'
        });
      }

      const result = await categoryService.searchCategories(q.trim());
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        count: result.data.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export default new CategoryController();
