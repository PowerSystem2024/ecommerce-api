import cartRepo from '../repositories/cartRepo.js';
import productService from './productService.js';

class CartService {
  async getCart(userId) {
    const cart = await cartRepo.findByUserId(userId);
    if (!cart) {
      // Crear carrito vacío si no existe
      return await cartRepo.create({ user: userId, items: [] });
    }
    // Calcular subtotales por item y totalAmount (asegurarnos que siempre esté actualizado al devolverlo)
    let total = 0;
    const itemsWithSubtotal = [];
    for (const item of cart.items) {
      // item.product puede venir poblado gracias al repo
      const product = item.product;
      const price = product && product.price ? product.price : 0;
      const subtotal = price * item.quantity;
      itemsWithSubtotal.push({
        product,
        quantity: item.quantity,
        subtotal
      });
      total += subtotal;
    }

    // Asegurar que el total en la entidad coincida (no forzamos persistencia aquí)
    cart.totalAmount = total;
    const cartObj = cart.toObject ? cart.toObject() : cart;
    cartObj.items = itemsWithSubtotal;
    cartObj.totalAmount = total;
    return cartObj;
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

    const cart = await cartRepo.addItem(userId, productId, quantity);
    // devolver formato con subtotales
    return await this.getCart(userId);
  }

  async updateItemQuantity(userId, productId, quantity) {
    if (quantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }

    // Verificar stock si la cantidad es mayor que 0
    if (quantity > 0) {
      const product = await productService.getProductById(productId);
      if (product.stock < quantity) {
        throw new Error('Stock insuficiente');
      }
    }

    await cartRepo.updateItemQuantity(userId, productId, quantity);
    return await this.getCart(userId);
  }

  async removeFromCart(userId, productId) {
    await cartRepo.removeItem(userId, productId);
    return await this.getCart(userId);
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
