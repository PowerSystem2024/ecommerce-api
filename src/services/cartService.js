import cartRepo from '../repositories/cartRepo.js';
import productService from './productService.js';

class CartService {
  async getCart(userId) {
    const cart = await cartRepo.findByUserId(userId);
    if (!cart) {
      // Crear carrito vacío si no existe
      return await cartRepo.create({ user: userId, items: [] });
    }
    return cart;
  }

  async addToCart(userId, productId, quantity = 1) {
    // Verificar que el producto existe y tiene stock
    const product = await productService.getProductById(productId);
    
    if (!product.isActive) {
      throw new Error('El producto no está disponible');
    }

    if (product.stock < quantity) {
      throw new Error('Stock insuficiente');
    }

    return await cartRepo.addItem(userId, productId, quantity);
  }

  async updateItemQuantity(userId, productId, quantity) {
    if (quantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }

    return await cartRepo.updateItemQuantity(userId, productId, quantity);
  }

  async removeFromCart(userId, productId) {
    return await cartRepo.removeItem(userId, productId);
  }

  async clearCart(userId) {
    return await cartRepo.clearCart(userId);
  }

  async getCartItems(userId) {
    const cart = await this.getCart(userId);
    return cart.items;
  }

  async validateCartStock(userId) {
    const cart = await this.getCart(userId);
    const errors = [];

    for (const item of cart.items) {
      const product = await productService.getProductById(item.product._id);
      
      if (!product.isActive) {
        errors.push(`El producto "${product.name}" no está disponible`);
      } else if (product.stock < item.quantity) {
        errors.push(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async createOrderFromCart(userId, shippingAddress) {
    const cart = await this.getCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    // Validar stock antes de crear la orden
    const validation = await this.validateCartStock(userId);
    if (!validation.isValid) {
      throw new Error(`Error de validación: ${validation.errors.join(', ')}`);
    }

    // Preparar datos para la orden
    const orderData = {
      products: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      shippingAddress
    };

    return orderData;
  }
}

export default new CartService();
