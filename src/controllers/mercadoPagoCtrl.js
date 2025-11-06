import mercadoPagoService from '../services/mercadoPagoService.js';

const mercadoPagoController = {
  /**
   * Crear pago único
   * POST /api/mercadopago/payments
   */
  async createPayment(req, res) {
    try {
      const payment = await mercadoPagoService.createPayment(req.body);
      
      res.status(201).json({
        success: true,
        data: payment,
        message: 'Pago creado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Obtener información de un pago
   * GET /api/mercadopago/payments/:id
   */
  async getPayment(req, res) {
    try {
      const payment = await mercadoPagoService.getPayment(req.params.id);
      
      res.json({
        success: true,
        data: payment,
        message: 'Pago obtenido exitosamente'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Crear suscripción
   * POST /api/mercadopago/subscriptions
   */
  async createSubscription(req, res) {
    try {
      const subscription = await mercadoPagoService.createSubscription(req.body);
      
      res.status(201).json({
        success: true,
        data: subscription,
        message: 'Suscripción creada exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Obtener información de una suscripción
   * GET /api/mercadopago/subscriptions/:id
   */
  async getSubscription(req, res) {
    try {
      const subscription = await mercadoPagoService.getSubscription(req.params.id);
      
      res.json({
        success: true,
        data: subscription,
        message: 'Suscripción obtenida exitosamente'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Cancelar suscripción
   * DELETE /api/mercadopago/subscriptions/:id
   */
  async cancelSubscription(req, res) {
    try {
      const result = await mercadoPagoService.cancelSubscription(req.params.id);
      
      res.json({
        success: true,
        data: result,
        message: 'Suscripción cancelada exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Webhook de MercadoPago
   * POST /api/mercadopago/webhook
   */
  async processWebhook(req, res) {
    try {
      // Extraer información del webhook
      const topic = req.query.topic || req.body.topic;
      const resourceId = req.query.id || req.query.resource_id || req.body.id || req.body.resource_id;
      const data = req.body.data || req.body;

      if (!topic || !resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Datos de webhook incompletos'
        });
      }

      await mercadoPagoService.processWebhook(topic, resourceId, data);

      res.json({
        success: true,
        message: 'Webhook procesado exitosamente'
      });
    } catch (error) {
      console.error('Error en webhook:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Obtener usuario actual de MercadoPago
   * GET /api/mercadopago/user/me
   */
  async getCurrentUser(req, res) {
    try {
      const authorization = req.headers.authorization;

      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización requerido'
        });
      }

      const accessToken = authorization.replace('Bearer ', '');
      const user = await mercadoPagoService.getCurrentUser(accessToken);

      res.json({
        success: true,
        data: user,
        message: 'Usuario obtenido exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Página de éxito (redirección después del pago)
   * GET /api/mercadopago/success
   */
  success(req, res) {
    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      paymentId: req.query.payment_id,
      status: req.query.status,
      externalReference: req.query.external_reference
    });
  },

  /**
   * Página de fallo (redirección después del pago)
   * GET /api/mercadopago/failure
   */
  failure(req, res) {
    res.json({
      success: false,
      message: 'El pago falló',
      paymentId: req.query.payment_id,
      status: req.query.status,
      externalReference: req.query.external_reference
    });
  },

  /**
   * Página de pendiente (redirección después del pago)
   * GET /api/mercadopago/pending
   */
  pending(req, res) {
    res.json({
      success: true,
      message: 'Pago pendiente',
      paymentId: req.query.payment_id,
      status: req.query.status,
      externalReference: req.query.external_reference
    });
  }
};

export default mercadoPagoController;

