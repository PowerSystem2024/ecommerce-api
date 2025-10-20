import orderRepo from '../repositories/orderRepo.js';
import productService from './productService.js';
import cartService from './cartService.js';
import { preference } from '../config/mercadoPago.js';

class OrderService {
  async createOrder(userId, orderData) {
    // Validar stock de productos
    for (const item of orderData.products) {
      const hasStock = await productService.checkStock(item.product, item.quantity);
      if (!hasStock) {
        throw new Error(`Stock insuficiente para el producto ${item.product}`);
      }
    }

    // Calcular total
    let totalAmount = 0;
    for (const item of orderData.products) {
      const product = await productService.getProductById(item.product);
      totalAmount += product.price * item.quantity;
      item.price = product.price;
    }

    const order = await orderRepo.create({
      user: userId,
      products: orderData.products,
      totalAmount,
      shippingAddress: orderData.shippingAddress
    });

    // Restar stock de productos
    for (const item of orderData.products) {
      await productService.updateStock(item.product, -item.quantity);
    }

    return order;
  }

  async createOrderFromCart(userId, shippingAddress) {
    // Obtener datos del carrito
    const orderData = await cartService.createOrderFromCart(userId, shippingAddress);
    
    // Crear la orden
    const order = await this.createOrder(userId, orderData);
    
    // Vaciar el carrito después de crear la orden
    await cartService.clearCart(userId);
    
    return order;
  }

  async getOrderById(id) {
    const order = await orderRepo.findById(id);
    if (!order) {
      throw new Error('Orden no encontrada');
    }
    return order;
  }

  async getUserOrders(userId) {
    return await orderRepo.findByUserId(userId);
  }

  async getAllOrders() {
    return await orderRepo.findAll();
  }

  async updateOrderStatus(id, status) {
    return await orderRepo.updateStatus(id, status);
  }

  async createPaymentPreference(orderId) {
    const order = await this.getOrderById(orderId);
    
    const preferenceData = {
      items: order.products.map(item => ({
        title: `Producto ${item.product.name}`,
        quantity: item.quantity,
        unit_price: item.price
      })),
      external_reference: orderId.toString(),
      notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`
    };

    return await preference.create({ body: preferenceData });
  }
}

export default new OrderService();
