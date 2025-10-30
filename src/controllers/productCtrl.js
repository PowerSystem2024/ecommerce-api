import productService from '../services/productService.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

const productController = {
  async createProduct(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async getProducts(req, res) {
    try {
      const products = await productService.getAllProducts(req.query);
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getProduct(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async searchProducts(req, res) {
    try {
      const result = await productService.searchProducts(req.query);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getSuggestions(req, res) {
    try {
      const { q, limit } = req.query;
      const suggestions = await productService.getSearchSuggestions(q, limit);
      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateProduct(req, res) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({
        success: true,
        message: 'Producto eliminado'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async uploadImages(req, res) {
    try {
      const files = req.files || [];
      if (!files.length) {
        return res.status(400).json({ success: false, message: 'No se enviaron imágenes' });
      }

      const folder = 'ecommerce/products';
      const uploads = await Promise.all(
        files.map(async (file) => {
          const result = await uploadToCloudinary(file.buffer, folder);
          return {
            url: result.secure_url,
            publicId: result.public_id
          };
        })
      );

      return res.status(201).json({ success: true, urls: uploads.map(u => u.url), assets: uploads });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default productController;
