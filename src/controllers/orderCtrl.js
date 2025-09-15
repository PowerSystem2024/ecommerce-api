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
  }
};

export default orderController;
