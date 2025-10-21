import orderService from '../services/orderService.js';

const orderController = {
  async createOrder(req, res) {
    try {
      const order = await orderService.createOrder(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async getOrders(req, res) {
    try {
      // Si es admin, puede ver todas las órdenes
      if (req.user.role === 'admin') {
        const orders = await orderService.getAllOrders();
        return res.json({
          success: true,
          data: orders
        });
      }
      
      // Si es usuario normal, solo ve sus órdenes
      const orders = await orderService.getUserOrders(req.user.userId);
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getOrder(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async createPayment(req, res) {
    try {
      const preference = await orderService.createPaymentPreference(req.params.id);
      res.json({
        success: true,
        data: preference
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status'
        });
      }

      const order = await orderService.updateOrderStatus(req.params.id, status);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async createOrderFromCart(req, res) {
    try {
      const { shippingAddress } = req.body;
      const order = await orderService.createOrderFromCart(req.user.userId, shippingAddress);
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default orderController;
