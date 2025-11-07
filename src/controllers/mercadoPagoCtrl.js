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
      console.log('=== WEBHOOK RECIBIDO ===');
      console.log('Query params:', req.query);
      console.log('Body:', JSON.stringify(req.body, null, 2));

      // MercadoPago puede enviar el webhook de diferentes formas:
      // 1. Como query params: ?topic=payment&id=123456789
      // 2. Como body: { type: "payment", action: "payment", data: { id: "123456789", status: "approved" } }
      // 3. Como body directo: { topic: "payment", id: "123456789" }

      let topic = req.query.type || req.query.topic || req.query.action || 
                  req.body.type || req.body.topic || req.body.action;
      let resourceId = req.query.id || req.query.data_id || 
                       req.body.data?.id || req.body.id || req.body.data_id;
      const data = req.body.data || req.body;

      // Si viene en formato de notificación de MercadoPago con action
      if (req.body.action && req.body.data) {
        topic = req.body.action; // action puede ser "payment" o "preapproval"
        resourceId = req.body.data.id;
      } else if (req.body.type && req.body.data) {
        topic = req.body.type;
        resourceId = req.body.data.id;
      }

      console.log(`Topic extraído: ${topic}`);
      console.log(`Resource ID extraído: ${resourceId}`);

      if (!topic || !resourceId) {
        console.error('Datos de webhook incompletos:', { topic, resourceId });
        // Responder 200 para que MercadoPago no reintente
        return res.status(200).json({
          success: false,
          message: 'Datos de webhook incompletos'
        });
      }

      // Procesar el webhook de forma asíncrona (no bloquear la respuesta)
      mercadoPagoService.processWebhook(topic, resourceId, data).catch(error => {
        console.error('Error procesando webhook (asíncrono):', error);
      });

      // Responder inmediatamente con 200 OK
      // MercadoPago requiere respuesta rápida, el procesamiento puede ser asíncrono
      res.status(200).json({
        success: true,
        message: 'Webhook recibido y procesando'
      });
    } catch (error) {
      console.error('Error en webhook:', error);
      // Siempre responder 200 para que MercadoPago no reintente infinitamente
      res.status(200).json({
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

