import orderRepo from '../repositories/orderRepo.js';
import productService from './productService.js';
import cartService from './cartService.js';
import mercadoPagoService from './mercadoPagoService.js';

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
      await productService.incrementSoldCount(item.product, item.quantity);
    }

    // Devolver la orden con los datos del producto poblados
    return await orderRepo.findById(order._id);
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
    
    // Usar el nuevo servicio de MercadoPago
    return await mercadoPagoService.createOrderPreference(order);
  }

  /**
   * Verificar y actualizar el estado del pago
   * Se usa cuando el usuario regresa de MercadoPago
   */
  async verifyAndUpdatePayment(paymentId, orderId) {
    try {
      console.log(`=== VERIFICANDO PAGO ===`);
      console.log(`Payment ID: ${paymentId}`);
      console.log(`Order ID: ${orderId}`);

      // Obtener información del pago desde MercadoPago
      const payment = await mercadoPagoService.getPayment(paymentId);
      
      console.log(`Pago obtenido:`, JSON.stringify(payment, null, 2));

      // Verificar que el external_reference coincida con el orderId
      if (payment.external_reference !== orderId.toString()) {
        console.warn(`External reference no coincide: ${payment.external_reference} !== ${orderId}`);
      }

      // Mapear estados de MercadoPago
      const paymentStatus = payment.status || 'pending';
      const isApproved = paymentStatus === 'approved';
      
      // Preparar datos de actualización
      const updateData = {
        paymentId: paymentId.toString(),
        paymentStatus: paymentStatus,
        isPaid: isApproved
      };

      // Si el pago fue aprobado, actualizar estado y fecha de pago
      if (isApproved) {
        updateData.status = 'confirmada';
        updateData.paidAt = new Date();
        console.log('✅ Pago aprobado - Actualizando orden');
      } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
        updateData.status = 'cancelada';
        console.log(`❌ Pago ${paymentStatus} - Actualizando orden`);
      }

      // Actualizar la orden
      const updatedOrder = await orderRepo.update(orderId, updateData);
      
      console.log(`✅ Orden actualizada:`, {
        orderId: orderId,
        status: updatedOrder.status,
        isPaid: updatedOrder.isPaid,
        paymentStatus: updatedOrder.paymentStatus
      });

      return updatedOrder;
    } catch (error) {
      console.error('Error verificando pago:', error);
      throw error;
    }
  }
}

export default new OrderService();
