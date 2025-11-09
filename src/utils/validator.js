import Joi from 'joi';

const validators = {
  // User validation schemas
  registerUser: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Product validation schemas
  createProduct: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().positive().required(),
    category: Joi.string().required(),
    stock: Joi.number().integer().min(0).required(),
    images: Joi.array().items(Joi.string().uri()),
    sku: Joi.string().pattern(/^[a-zA-Z0-9._-]+$/).min(2).max(50).optional(),
    sizes: Joi.array().items(Joi.string().min(1)).optional(),
    colors: Joi.array().items(Joi.string().min(1)).optional(),
    tags: Joi.array().items(Joi.string().min(1)).optional(),
    soldCount: Joi.number().integer().min(0).optional()
  }),

  // Order validation schemas
  createOrder: Joi.object({
    products: Joi.array().items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().integer().positive().required()
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required()
    }).required()
  }),

  createOrderFromCart: Joi.object({
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required()
    }).required()
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string().valid('pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada').required()
  }),

  // Cart validation schemas
  addToCart: Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().positive().default(1)
  }),

  updateCartItem: Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(0).required()
  }),

  // Category validation schemas
  createCategory: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(200).optional()
  }),

  updateCategory: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    description: Joi.string().max(200).optional()
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

export { validators, validate };
