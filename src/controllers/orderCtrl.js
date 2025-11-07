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

  /**
   * Verificar y actualizar estado de pago
   * POST /api/orders/:id/verify-payment
   * Se usa cuando el usuario regresa de MercadoPago
   */
  async verifyPayment(req, res) {
    try {
      const { paymentId } = req.body;
      const orderId = req.params.id;

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: 'paymentId es requerido'
        });
      }

      const updatedOrder = await orderService.verifyAndUpdatePayment(paymentId, orderId);

      res.json({
        success: true,
        data: updatedOrder,
        message: 'Pago verificado y orden actualizada'
      });
    } catch (error) {
      res.status(400).json({
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
      const validStatuses = ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado de orden inválido'
        });
      }

      const order = await orderService.updateOrderStatus(req.params.id, status);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
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
  },

  /**
   * Página de éxito después del pago
   * GET /api/orders/success
   * Verifica el pago y actualiza la orden antes de redirigir
   */
  async paymentSuccess(req, res) {
    try {
      const { payment_id, status, external_reference, preference_id } = req.query;
      
      // Si tenemos payment_id y orderId, verificar y actualizar el estado del pago
      if (payment_id && external_reference) {
        try {
          await orderService.verifyAndUpdatePayment(payment_id, external_reference);
        } catch (error) {
          console.error('Error verificando pago:', error);
          // Continuar con la redirección aunque falle la verificación
        }
      }
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      // Redirigir al frontend con los parámetros del pago
      const redirectUrl = new URL(`${frontendUrl}/shop`);
      redirectUrl.searchParams.set('payment', 'success');
      if (payment_id) redirectUrl.searchParams.set('paymentId', payment_id);
      if (status) redirectUrl.searchParams.set('status', status);
      if (external_reference) redirectUrl.searchParams.set('orderId', external_reference);
      if (preference_id) redirectUrl.searchParams.set('preferenceId', preference_id);
      
      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Error en paymentSuccess:', error);
      // Redirigir de todas formas
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/shop?payment=success`);
    }
  },

  /**
   * Página de fallo después del pago
   * GET /api/orders/failure
   * Redirige al frontend con los parámetros del pago
   */
  paymentFailure(req, res) {
    const { payment_id, status, external_reference, preference_id } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redirigir al frontend con los parámetros del pago
    const redirectUrl = new URL(`${frontendUrl}/shop`);
    redirectUrl.searchParams.set('payment', 'failure');
    if (payment_id) redirectUrl.searchParams.set('paymentId', payment_id);
    if (status) redirectUrl.searchParams.set('status', status);
    if (external_reference) redirectUrl.searchParams.set('orderId', external_reference);
    if (preference_id) redirectUrl.searchParams.set('preferenceId', preference_id);
    
    res.redirect(redirectUrl.toString());
  },

  /**
   * Página de pago pendiente
   * GET /api/orders/pending
   * Redirige al frontend con los parámetros del pago
   */
  paymentPending(req, res) {
    const { payment_id, status, external_reference, preference_id } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redirigir al frontend con los parámetros del pago
    const redirectUrl = new URL(`${frontendUrl}/shop`);
    redirectUrl.searchParams.set('payment', 'pending');
    if (payment_id) redirectUrl.searchParams.set('paymentId', payment_id);
    if (status) redirectUrl.searchParams.set('status', status);
    if (external_reference) redirectUrl.searchParams.set('orderId', external_reference);
    if (preference_id) redirectUrl.searchParams.set('preferenceId', preference_id);
    
    res.redirect(redirectUrl.toString());
  }
};

export default orderController;
