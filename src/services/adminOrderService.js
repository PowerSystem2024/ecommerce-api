import Order from '../models/Order.js';

/**
 * Servicio de Gestión de Órdenes para Admin
 * Responsabilidad: Lógica de negocio para administración de órdenes
 * Principio SOLID: Single Responsibility - Solo maneja operaciones admin de órdenes
 */
class AdminOrderService {
  /**
   * Obtiene todas las órdenes con paginación y filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Object} Lista de órdenes paginada
   */
  async getAllOrders(filters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      minAmount,
      maxAmount,
      startDate,
      endDate
    } = filters;

    // Construir query de filtros
    const query = {};

    if (status) {
      query.status = status;
    }

    if (userId) {
      query.user = userId;
    }

    // Filtro por rango de monto
    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) query.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) query.totalAmount.$lte = parseFloat(maxAmount);
    }

    // Filtro por rango de fechas
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('products.product', 'name price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtiene una orden por ID con información completa
   * @param {String} orderId - ID de la orden
   * @returns {Object} Orden
   */
  async getOrderById(orderId) {
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone address')
      .populate('products.product', 'name price images category')
      .lean();

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    return order;
  }

  /**
   * Actualiza el estado de una orden
   * @param {String} orderId - ID de la orden
   * @param {String} newStatus - Nuevo estado
   * @returns {Object} Orden actualizada
   */
  async updateOrderStatus(orderId, newStatus) {
    // Validar estado
    const validStatuses = ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Orden no encontrada');
    }

    // Validar transiciones de estado
    if (order.status === 'cancelada') {
      throw new Error('No se puede modificar una orden cancelada');
    }

    if (order.status === 'entregada' && newStatus !== 'entregada') {
      throw new Error('No se puede modificar una orden ya entregada');
    }

    order.status = newStatus;
    await order.save();

    return await this.getOrderById(orderId);
  }

  /**
   * Obtiene estadísticas de órdenes
   * @returns {Object} Estadísticas
   */
  async getOrderStats() {
    const [
      totalOrders,
      ordersByStatus,
      revenueStats
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $in: ['confirmada', 'enviada', 'entregada'] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' },
            completedOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    const revenue = revenueStats[0] || { 
      totalRevenue: 0, 
      averageOrderValue: 0, 
      completedOrders: 0 
    };

    return {
      totalOrders,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      totalRevenue: revenue.totalRevenue,
      averageOrderValue: revenue.averageOrderValue,
      completedOrders: revenue.completedOrders
    };
  }

  /**
   * Obtiene órdenes recientes
   * @param {Number} limit - Cantidad de órdenes a obtener
   * @returns {Array} Órdenes recientes
   */
  async getRecentOrders(limit = 10) {
    return await Order.find()
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

export default new AdminOrderService();
