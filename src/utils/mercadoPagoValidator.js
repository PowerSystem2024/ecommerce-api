import Joi from 'joi';

const mercadoPagoValidators = {
  // Validación para crear pago
  createPayment: Joi.object({
    transactionAmount: Joi.number().positive().required(),
    description: Joi.string().min(3).max(200).required(),
    payerEmail: Joi.string().email().required(),
    externalReference: Joi.string().optional(),
    successUrl: Joi.string().uri().optional(),
    failureUrl: Joi.string().uri().optional(),
    pendingUrl: Joi.string().uri().optional(),
    notificationUrl: Joi.string().uri().optional()
  }),

  // Validación para crear suscripción
  createSubscription: Joi.object({
    payerEmail: Joi.string().email().required(),
    reason: Joi.string().min(3).max(200).required(),
    frequency: Joi.number().integer().min(1).required(),
    frequencyType: Joi.string().valid('days', 'months').required(),
    transactionAmount: Joi.number().positive().required(),
    currencyId: Joi.string().default('ARS').optional(),
    backUrl: Joi.string().uri().optional(),
    cancelUrl: Joi.string().uri().optional(),
    externalReference: Joi.string().optional()
  }),

  // Validación para webhook
  webhook: Joi.object({
    topic: Joi.string().optional(),
    resource_id: Joi.string().optional(),
    data: Joi.object().optional()
  }).unknown(true) // Permitir campos adicionales de MercadoPago
};

export default mercadoPagoValidators;

