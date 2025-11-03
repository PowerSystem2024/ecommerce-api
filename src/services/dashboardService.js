import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

/**
 * Servicio de Dashboard
 * Responsabilidad: Lógica de negocio para estadísticas y métricas del panel de administración
 * Principio SOLID: Single Responsibility - Solo maneja lógica de estadísticas
 */
class DashboardService {
  /**
   * Obtiene estadísticas generales del dashboard
   * @returns {Object} Estadísticas generales
   */
  async getGeneralStats() {
    try {
      // Ejecutar consultas en paralelo para optimizar rendimiento
      const [
        totalUsers,
        totalOrders,
        totalProducts,
        totalReviews,
        revenueData,
        recentOrders,
        topProducts
      ] = await Promise.all([
        this._getTotalUsers(),
        this._getTotalOrders(),
        this._getTotalProducts(),
        this._getTotalReviews(),
        this._getTotalRevenue(),
        this._getRecentOrders(),
        this._getTopProducts()
      ]);

      return {
        totalUsers,
        totalOrders,
        totalProducts,
        totalReviews,
        totalRevenue: revenueData.total,
        averageOrderValue: revenueData.average,
        recentOrders,
        topProducts
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Obtiene el total de usuarios registrados
   * @private
   */
  async _getTotalUsers() {
    return await User.countDocuments();
  }

  /**
   * Obtiene el total de órdenes
   * @private
   */
  async _getTotalOrders() {
    return await Order.countDocuments();
  }

  /**
   * Obtiene el total de productos
   * @private
   */
  async _getTotalProducts() {
    return await Product.countDocuments();
  }

  /**
   * Obtiene el total de reseñas
   * @private
   */
  async _getTotalReviews() {
    return await Review.countDocuments();
  }

  /**
   * Calcula los ingresos totales y promedio
   * @private
   */
  async _getTotalRevenue() {
    const result = await Order.aggregate([
      {
        $match: {
          status: { $in: ['confirmada', 'enviada', 'entregada'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const data = result[0] || { total: 0, count: 0 };
    return {
      total: data.total,
      average: data.count > 0 ? data.total / data.count : 0
    };
  }

  /**
   * Obtiene las últimas 5 órdenes
   * @private
   */
  async _getRecentOrders() {
    return await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .select('totalAmount status createdAt')
      .lean();
  }

  /**
   * Obtiene los 5 productos más vendidos
   * @private
   */
  async _getTopProducts() {
    return await Order.aggregate([
      {
        $match: {
          status: { $in: ['confirmada', 'enviada', 'entregada'] }
        }
      },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          totalSold: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 1,
          name: '$productInfo.name',
          totalSold: 1,
          revenue: 1,
          image: { $arrayElemAt: ['$productInfo.images', 0] }
        }
      }
    ]);
  }

  /**
   * Obtiene reporte de ventas por período
   * @param {String} period - Período: 'day', 'week', 'month', 'year'
   * @returns {Object} Reporte de ventas
   */
  async getSalesReport(period = 'month') {
    const dateRange = this._getDateRange(period);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: { $in: ['confirmada', 'enviada', 'entregada'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: this._getDateFormat(period),
              date: '$createdAt'
            }
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      period,
      dateRange: {
        start: dateRange.start,
        end: dateRange.end
      },
      data: salesData
    };
  }

  /**
   * Calcula el rango de fechas según el período
   * @private
   */
  _getDateRange(period) {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }

    return { start, end };
  }

  /**
   * Obtiene el formato de fecha según el período
   * @private
   */
  _getDateFormat(period) {
    switch (period) {
      case 'day':
        return '%Y-%m-%d %H:00';
      case 'week':
      case 'month':
        return '%Y-%m-%d';
      case 'year':
        return '%Y-%m';
      default:
        return '%Y-%m-%d';
    }
  }
}

export default new DashboardService();
