import { paymentClient, preferenceClient, preApprovalClient, appUrl } from '../config/mercadoPago.js';

class MercadoPagoService {
  /**
   * Crear suscripción recurrente
   */
  async createSubscription(createSubscriptionDto) {
    try {
      console.log('=== INICIO CREACIÓN SUSCRIPCIÓN ===');
      console.log('Datos de entrada:', JSON.stringify(createSubscriptionDto, null, 2));

      const subscriptionData = {
        reason: createSubscriptionDto.reason,
        auto_recurring: {
          frequency: createSubscriptionDto.frequency,
          frequency_type: createSubscriptionDto.frequencyType,
          transaction_amount: createSubscriptionDto.transactionAmount,
          currency_id: createSubscriptionDto.currencyId || 'ARS'
        },
        back_url: createSubscriptionDto.backUrl || `${appUrl}/mercadopago/success`,
        cancel_url: createSubscriptionDto.cancelUrl || `${appUrl}/mercadopago/cancel`,
        external_reference: createSubscriptionDto.externalReference,
        payer_email: createSubscriptionDto.payerEmail,
        status: 'pending'
      };

      console.log('Datos enviados a Mercado Pago:', JSON.stringify(subscriptionData, null, 2));

      const subscription = await preApprovalClient.create({
        body: subscriptionData
      });

      console.log('Respuesta de Mercado Pago:', JSON.stringify(subscription, null, 2));

      const isSandbox = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-') || false;

      return {
        id: subscription.id,
        externalId: subscription.id,
        status: subscription.status || 'pending',
        initPoint: subscription.init_point || '',
        sandboxInitPoint: isSandbox ? subscription.init_point || '' : '',
        environment: isSandbox ? 'sandbox' : 'production',
        isTestMode: isSandbox
      };
    } catch (error) {
      console.error('=== ERROR EN CREACIÓN SUSCRIPCIÓN ===');
      console.error('Error completo:', error);
      console.error('Mensaje de error:', error instanceof Error ? error.message : 'Error desconocido');
      throw new Error(`Error al crear suscripción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Crear pago único personalizado
   */
  async createPayment(createPaymentDto) {
    try {
      console.log('Creando pago único en Mercado Pago');

      const successUrl = createPaymentDto.successUrl || `${appUrl}/mercadopago/success`;
      const failureUrl = createPaymentDto.failureUrl || `${appUrl}/mercadopago/failure`;
      const pendingUrl = createPaymentDto.pendingUrl || `${appUrl}/mercadopago/pending`;

      const preferenceData = {
        items: [
          {
            id: 'item-1',
            title: createPaymentDto.description,
            quantity: 1,
            unit_price: createPaymentDto.transactionAmount,
            currency_id: 'ARS'
          }
        ],
        payer: {
          email: createPaymentDto.payerEmail
        },
        external_reference: createPaymentDto.externalReference,
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl
        },
        notification_url: createPaymentDto.notificationUrl || `${appUrl}/api/mercadopago/webhook`,
        auto_return: 'approved'
      };

      const preference = await preferenceClient.create({
        body: preferenceData
      });

      console.log(`Pago creado: ${preference.id}`);

      return {
        id: preference.id || '',
        externalId: preference.id || '',
        status: 'pending',
        initPoint: preference.init_point || '',
        sandboxInitPoint: preference.sandbox_init_point || ''
      };
    } catch (error) {
      console.error('Error al crear pago:', error);
      throw new Error(`Error al crear pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Crear preferencia de pago para una orden
   */
  async createOrderPreference(order) {
    try {
      console.log('=== CREANDO PREFERENCIA DE PAGO ===');
      console.log('Order ID:', order._id);
      console.log('Total:', order.totalAmount);

      const preferenceData = {
        items: order.products.map((item) => ({
          id: item.product._id?.toString() || item.product.toString(),
          title: item.product.name || 'Producto',
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: 'ARS'
        })),
        payer: {
          email: order.user.email || 'test@test.com'
        },
        external_reference: order._id.toString(),
        back_urls: {
          success: `${appUrl}/orders/success`,
          failure: `${appUrl}/orders/failure`,
          pending: `${appUrl}/orders/pending`
        },
        notification_url: `${appUrl}/api/mercadopago/webhook`
      };

      console.log('Datos de preferencia:', JSON.stringify(preferenceData, null, 2));

      const preference = await preferenceClient.create({
        body: preferenceData
      });

      console.log('Preferencia creada:', preference.id);

      return {
        id: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point || preference.init_point
      };
    } catch (error) {
      console.error('Error creando preferencia:', error);
      throw new Error(`Error al crear preferencia de pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener información de una suscripción
   */
  async getSubscription(subscriptionId) {
    try {
      const mpSubscription = await preApprovalClient.get({
        id: subscriptionId
      });

      return mpSubscription;
    } catch (error) {
      console.error('Error al obtener suscripción:', error);
      throw new Error(`Error al obtener suscripción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener información de un pago
   */
  async getPayment(paymentId) {
    try {
      const mpPayment = await paymentClient.get({
        id: paymentId
      });

      return mpPayment;
    } catch (error) {
      console.error('Error al obtener pago:', error);
      throw new Error(`Error al obtener pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Cancelar una suscripción
   */
  async cancelSubscription(subscriptionId) {
    try {
      await preApprovalClient.update({
        id: subscriptionId,
        body: { status: 'cancelled' }
      });

      console.log(`Suscripción cancelada: ${subscriptionId}`);
      return { success: true, message: 'Suscripción cancelada exitosamente' };
    } catch (error) {
      console.error('Error al cancelar suscripción:', error);
      throw new Error(`Error al cancelar suscripción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Procesar webhook de MercadoPago
   */
  async processWebhook(topic, resourceId, data) {
    try {
      console.log(`Procesando webhook: ${topic} - ${resourceId}`);

      // Procesar según el tipo de notificación
      switch (topic) {
        case 'payment':
          await this.processPaymentWebhook(resourceId, data);
          break;
        case 'preapproval':
          await this.processSubscriptionWebhook(resourceId, data);
          break;
        default:
          console.warn(`Tipo de webhook no manejado: ${topic}`);
      }

      console.log(`Webhook procesado exitosamente: ${topic} - ${resourceId}`);
    } catch (error) {
      console.error('Error al procesar webhook:', error);
      throw error;
    }
  }

  /**
   * Procesar webhook de pago
   */
  async processPaymentWebhook(paymentId, data) {
    try {
      console.log(`Procesando webhook de pago: ${paymentId} - Estado: ${data.status}`);
      // Aquí se puede implementar la lógica específica para procesar pagos
      // Por ejemplo, notificar a otros servicios, actualizar base de datos, etc.
    } catch (error) {
      console.error('Error al procesar webhook de pago:', error);
      throw error;
    }
  }

  /**
   * Procesar webhook de suscripción
   */
  async processSubscriptionWebhook(subscriptionId, data) {
    try {
      console.log(`Procesando webhook de suscripción: ${subscriptionId} - Estado: ${data.status}`);
      // Aquí se puede implementar la lógica específica para procesar suscripciones
      // Por ejemplo, notificar a otros servicios, actualizar base de datos, etc.
    } catch (error) {
      console.error('Error al procesar webhook de suscripción:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario actual de MercadoPago
   */
  async getCurrentUser(accessToken) {
    try {
      console.log('=== OBTENIENDO USUARIO ACTUAL DESDE MERCADO PAGO ===');
      console.log('Token recibido:', accessToken.substring(0, 10) + '...');

      const response = await fetch('https://api.mercadopago.com/users/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta de Mercado Pago:', response.status, errorText);
        throw new Error(`Error de MercadoPago: ${response.status} - ${errorText}`);
      }

      const userData = await response.json();
      console.log('Respuesta de Mercado Pago:', JSON.stringify(userData, null, 2));

      console.log('=== USUARIO ACTUAL OBTENIDO ===');
      return userData;
    } catch (error) {
      console.error('=== ERROR OBTENIENDO USUARIO ACTUAL ===');
      console.error('Error completo:', error);
      console.error('Mensaje de error:', error instanceof Error ? error.message : 'Error desconocido');

      throw new Error(`Error al obtener usuario actual: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}

export default new MercadoPagoService();
