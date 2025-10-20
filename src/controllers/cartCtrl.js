import cartService from '../services/cartService.js';

const cartController = {
  async getCart(req, res) {
    try {
      const cart = await cartService.getCart(req.user.userId);
      res.json({
        success: true,
        data: cart
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async addToCart(req, res) {
    try {
      const { productId, quantity } = req.body;
      const cart = await cartService.addToCart(req.user.userId, productId, quantity);
      res.json({
        success: true,
        data: cart
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateItemQuantity(req, res) {
    try {
      // Support both routes: /items/:productId or /update with productId in body
      const productId = req.params.productId || req.body.productId;
      const { quantity } = req.body;
      const cart = await cartService.updateItemQuantity(req.user.userId, productId, quantity);
      res.json({
        success: true,
        data: cart
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async removeFromCart(req, res) {
    try {
      const { productId } = req.params;
      const cart = await cartService.removeFromCart(req.user.userId, productId);
      res.json({
        success: true,
        data: cart
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async clearCart(req, res) {
    try {
      const cart = await cartService.clearCart(req.user.userId);
      res.json({
        success: true,
        data: cart
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default cartController;
