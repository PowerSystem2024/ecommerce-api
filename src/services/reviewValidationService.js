import Order from '../models/Order.js';
import Review from '../models/Review.js';

/**
 * Servicio para validar si un usuario puede hacer reseña de un producto
 */
class ReviewValidationService {
  /**
   * Verifica si un usuario puede hacer reseña de un producto
   * @param {String} userId - ID del usuario
   * @param {String} productId - ID del producto
   * @returns {Object} Resultado de la validación
   */
  async canUserReviewProduct(userId, productId) {
    try {
      // Buscar órdenes entregadas del usuario que contengan el producto
      const deliveredOrders = await Order.find({
        user: userId,
        status: 'entregada',
        'products.product': productId
      }).select('_id products');

      if (deliveredOrders.length === 0) {
        return {
          canReview: false,
          reason: 'Debes haber comprado y recibido el producto para poder hacer una reseña',
          availableOrders: []
        };
      }

      // Verificar qué órdenes ya tienen reseña para este producto
      const existingReviews = await Review.find({
        user: userId,
        product: productId
      }).select('order');

      const reviewedOrderIds = existingReviews.map(review => review.order.toString());
      
      // Filtrar órdenes que aún no tienen reseña
      const availableOrders = deliveredOrders.filter(order => 
        !reviewedOrderIds.includes(order._id.toString())
      );

      if (availableOrders.length === 0) {
        return {
          canReview: false,
          reason: 'Ya has hecho reseña de este producto en todas tus compras',
          availableOrders: []
        };
      }

      return {
        canReview: true,
        reason: 'Puedes hacer reseña de este producto',
        availableOrders: availableOrders.map(order => ({
          orderId: order._id,
          products: order.products
        }))
      };

    } catch (error) {
      throw new Error(`Error al validar reseña: ${error.message}`);
    }
  }

  /**
   * Obtiene productos que el usuario puede reseñar
   * @param {String} userId - ID del usuario
   * @returns {Array} Lista de productos que puede reseñar
   */
  async getReviewableProducts(userId) {
    try {
      // Buscar todas las órdenes entregadas del usuario
      const deliveredOrders = await Order.find({
        user: userId,
        status: 'entregada'
      }).populate('products.product', 'name images price');

      if (deliveredOrders.length === 0) {
        return [];
      }

      // Obtener todas las reseñas existentes del usuario
      const existingReviews = await Review.find({
        user: userId
      }).select('product order');

      // Crear un mapa de productos ya reseñados por orden
      const reviewedMap = new Map();
      existingReviews.forEach(review => {
        const key = `${review.product}_${review.order}`;
        reviewedMap.set(key, true);
      });

      // Recopilar productos que se pueden reseñar
      const reviewableProducts = [];
      
      deliveredOrders.forEach(order => {
        order.products.forEach(item => {
          const key = `${item.product._id}_${order._id}`;
          if (!reviewedMap.has(key)) {
            reviewableProducts.push({
              orderId: order._id,
              orderDate: order.createdAt,
              product: item.product,
              quantity: item.quantity,
              price: item.price
            });
          }
        });
      });

      return reviewableProducts;

    } catch (error) {
      throw new Error(`Error al obtener productos reseñables: ${error.message}`);
    }
  }
}

export default new ReviewValidationService();
