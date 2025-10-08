import productRepo from '../repositories/productRepo.js';

class ProductService {
  async createProduct(productData) {
    // Validaciones de negocio aquí
    if (productData.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    
    return await productRepo.create(productData);
  }

  async getProductById(id) {
    const product = await productRepo.findById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  async getAllProducts(filters = {}) {
    // Validar y sanitizar filtros aquí si es necesario
    return await productRepo.findAll(filters);
  }

  async updateProduct(id, updateData) {
    const product = await this.getProductById(id);
    return await productRepo.update(id, updateData);
  }

  async deleteProduct(id) {
    const product = await this.getProductById(id);
    return await productRepo.delete(id);
  }

  async getProductsByCategory(category) {
    return await productRepo.findByCategory(category);
  }

  async checkStock(id, quantity) {
    const product = await this.getProductById(id);
    return product.stock >= quantity;
  }
}

export default new ProductService();
