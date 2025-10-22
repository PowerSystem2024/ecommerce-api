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

    // Mapear parámetros de query a tipos apropiados
    const { category, minPrice, maxPrice, inStock, sortBy, sortOrder, page, limit, name, sizes, colors, tags } = filters;

    // Normalizar y validar page y limit
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    if (!Number.isInteger(pageNum) || pageNum < 1) {
      const error = new Error('El parámetro "page" debe ser un entero positivo');
      error.status = 400;
      throw error;
    }
    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      const error = new Error('El parámetro "limit" debe ser un entero positivo (máx 100)');
      error.status = 400;
      throw error;
    }

    // Normalizar y validar minPrice y maxPrice
    let minPriceNum = undefined;
    let maxPriceNum = undefined;
    if (minPrice !== undefined) {
      minPriceNum = Number(minPrice);
      if (isNaN(minPriceNum) || minPriceNum < 0) {
        const error = new Error('El parámetro "minPrice" debe ser un número positivo');
        error.status = 400;
        throw error;
      }
    }
    if (maxPrice !== undefined) {
      maxPriceNum = Number(maxPrice);
      if (isNaN(maxPriceNum) || maxPriceNum < 0) {
        const error = new Error('El parámetro "maxPrice" debe ser un número positivo');
        error.status = 400;
        throw error;
      }
    }
    if (minPriceNum !== undefined && maxPriceNum !== undefined && minPriceNum > maxPriceNum) {
      const error = new Error('El parámetro "minPrice" no puede ser mayor que "maxPrice"');
      error.status = 400;
      throw error;
    }

    const query = { isActive: true };
    if (category) query.category = category;
    if (name) query.name = { $regex: name, $options: 'i' };
    if (minPriceNum !== undefined || maxPriceNum !== undefined) {
      query.price = {};
      if (minPriceNum !== undefined) query.price.$gte = minPriceNum;
      if (maxPriceNum !== undefined) query.price.$lte = maxPriceNum;
    }
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }
    if (sizes) {
      const sizesArray = Array.isArray(sizes) ? sizes : sizes.split(',');
      query.sizes = { $in: sizesArray.map((size) => size.trim()).filter(Boolean) };
    }
    if (colors) {
      const colorsArray = Array.isArray(colors) ? colors : colors.split(',');
      query.colors = { $in: colorsArray.map((color) => color.trim()).filter(Boolean) };
    }
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagsArray.map((tag) => tag.trim()).filter(Boolean) };
    }
    const options = { sortBy: sortBy || 'name', sortOrder: sortOrder || 'asc', page: pageNum, limit: limitNum };
    return await productRepo.findWithFilters(query, options);
  }

  async updateProduct(id, updateData) {
    const product = await this.getProductById(id);
    return await productRepo.update(id, updateData);
  }

  async deleteProduct(id) {
    const product = await this.getProductById(id);

    if (!product.isActive) {
      throw new Error('El producto ya se encuentra inactivo');
    }

    return await productRepo.delete(id);
  }

  async searchProducts(filters = {}) {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      sortOrder,
      page,
      limit,
      sizes,
      colors,
      tags
    } = filters;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    if (!Number.isInteger(pageNum) || pageNum < 1) {
      const error = new Error('El parámetro "page" debe ser un entero positivo');
      error.status = 400;
      throw error;
    }
    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      const error = new Error('El parámetro "limit" debe ser un entero positivo (máx 100)');
      error.status = 400;
      throw error;
    }

    let minPriceNum;
    let maxPriceNum;
    if (minPrice !== undefined) {
      minPriceNum = Number(minPrice);
      if (isNaN(minPriceNum) || minPriceNum < 0) {
        const error = new Error('El parámetro "minPrice" debe ser un número positivo');
        error.status = 400;
        throw error;
      }
    }
    if (maxPrice !== undefined) {
      maxPriceNum = Number(maxPrice);
      if (isNaN(maxPriceNum) || maxPriceNum < 0) {
        const error = new Error('El parámetro "maxPrice" debe ser un número positivo');
        error.status = 400;
        throw error;
      }
    }
    if (minPriceNum !== undefined && maxPriceNum !== undefined && minPriceNum > maxPriceNum) {
      const error = new Error('El parámetro "minPrice" no puede ser mayor que "maxPrice"');
      error.status = 400;
      throw error;
    }

    const query = { isActive: true };
    if (q) {
      query.$text = { $search: q };
    }
    if (category) query.category = category;
    if (minPriceNum !== undefined || maxPriceNum !== undefined) {
      query.price = {};
      if (minPriceNum !== undefined) query.price.$gte = minPriceNum;
      if (maxPriceNum !== undefined) query.price.$lte = maxPriceNum;
    }
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }
    if (sizes) {
      const sizesArray = Array.isArray(sizes) ? sizes : sizes.split(',');
      query.sizes = { $in: sizesArray.map((size) => size.trim()).filter(Boolean) };
    }
    if (colors) {
      const colorsArray = Array.isArray(colors) ? colors : colors.split(',');
      query.colors = { $in: colorsArray.map((color) => color.trim()).filter(Boolean) };
    }
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagsArray.map((tag) => tag.trim()).filter(Boolean) };
    }

    const options = {
      sortBy: sortBy || (q ? 'relevance' : 'name'),
      sortOrder: sortOrder || (q ? 'desc' : 'asc'),
      page: pageNum,
      limit: limitNum,
      useTextScore: Boolean(q)
    };

    return await productRepo.findWithFilters(query, options);
  }

  async getSearchSuggestions(term, limit = 5) {
    if (!term || term.trim().length === 0) {
      return [];
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 20);
    return await productRepo.getSuggestions(term.trim(), safeLimit);
  }

  async getProductsByCategory(categoryId) {
    return await productRepo.findByCategory(categoryId);
  }

  async getProductsWithFilters(filters = {}) {
    const { category, minPrice, maxPrice, inStock, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = filters;
    
    const query = { isActive: true };
    
    // Filtro por categoría
    if (category) {
      query.category = category;
    }
    
    // Filtro por precio
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }
    
    // Filtro por stock
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }
    
    return await productRepo.findWithFilters(query, { sortBy, sortOrder, page, limit });
  }

  async checkStock(id, quantity) {
    const product = await this.getProductById(id);
    return product.stock >= quantity;
  }

  async updateStock(id, quantityChange) {
    const product = await this.getProductById(id);
    const newStock = product.stock + quantityChange;
    
    if (newStock < 0) {
      throw new Error('No se puede reducir el stock por debajo de 0');
    }
    
    return await productRepo.updateStock(id, newStock);
  }

  async incrementSoldCount(id, quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      const error = new Error('La cantidad vendida debe ser un entero positivo');
      error.status = 400;
      throw error;
    }
    return await productRepo.incrementSoldCount(id, quantity);
  }
}

export default new ProductService();
