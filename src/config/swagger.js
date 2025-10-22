const swaggerSpec = {
  openapi: '3.0.1',
  info: {
    title: 'Ecommerce API',
    version: '1.0.0',
    description:
      'API de ecommerce para tienda de ropa. Incluye autenticación, productos, categorías, carrito, órdenes y reseñas. Cada endpoint detalla requisitos de autenticación y formatos de entrada/salida.'
  },
  servers: [
    {
      url: 'http://localhost:3001/api',
      description: 'Servidor local'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Registro, login y gestión de credenciales' },
    { name: 'Products', description: 'Gestión y consulta de productos' },
    { name: 'Categories', description: 'Gestión de categorías' },
    { name: 'Cart', description: 'Operaciones del carrito de compras' },
    { name: 'Orders', description: 'Checkout y seguimiento de órdenes' },
    { name: 'Reviews', description: 'Reseñas y valoraciones de productos' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 6, example: 'SecurePass123' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', example: 'SecurePass123' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          token: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string', enum: ['user', 'admin'] }
            }
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' }
        }
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          sku: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          category: { $ref: '#/components/schemas/Category' },
          stock: { type: 'number' },
          images: {
            type: 'array',
            items: { type: 'string' }
          },
          sizes: {
            type: 'array',
            items: { type: 'string' }
          },
          colors: {
            type: 'array',
            items: { type: 'string' }
          },
          tags: {
            type: 'array',
            items: { type: 'string' }
          },
          isActive: { type: 'boolean' },
          averageRating: { type: 'number', format: 'float' },
          reviewsCount: { type: 'integer' },
          soldCount: { type: 'integer' }
        }
      },
      Review: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          product: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      ReviewInput: {
        type: 'object',
        required: ['product', 'rating'],
        properties: {
          product: { type: 'string', description: 'ID del producto' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string', maxLength: 500 }
        }
      },
      CartItem: {
        type: 'object',
        properties: {
          product: { $ref: '#/components/schemas/Product' },
          quantity: { type: 'integer', minimum: 1 }
        }
      },
      Cart: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' }
          },
          totalAmount: { type: 'number' }
        }
      },
      ShippingAddress: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          zipCode: { type: 'string' },
          country: { type: 'string' }
        }
      },
      OrderProduct: {
        type: 'object',
        properties: {
          product: { $ref: '#/components/schemas/Product' },
          quantity: { type: 'integer', minimum: 1 },
          price: { type: 'number' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          products: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderProduct' }
          },
          totalAmount: { type: 'number' },
          status: {
            type: 'string',
            enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
          },
          shippingAddress: { $ref: '#/components/schemas/ShippingAddress' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registro de un nuevo usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuario registrado correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          400: { description: 'Datos inválidos o usuario existente' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Inicio de sesión',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Inicio de sesión exitoso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          401: { description: 'Credenciales inválidas' }
        }
      }
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Listar productos con filtros opcionales',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'name', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number', minimum: 0 } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number', minimum: 0 } },
          { name: 'inStock', in: 'query', schema: { type: 'boolean' } },
          { name: 'sizes', in: 'query', schema: { type: 'string', description: 'Lista separada por comas, e.g., S,M,L' } },
          { name: 'colors', in: 'query', schema: { type: 'string', description: 'Lista separada por comas, e.g., red,blue' } },
          { name: 'tags', in: 'query', schema: { type: 'string', description: 'Lista separada por comas, e.g., nuevo,oferta' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'price', 'createdAt', 'stock'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }
        ],
        responses: {
          200: {
            description: 'Listado de productos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        products: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Product' }
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            currentPage: { type: 'integer' },
                            totalPages: { type: 'integer' },
                            totalProducts: { type: 'integer' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Products'],
        summary: 'Crear producto (solo admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' }
            }
          }
        },
        responses: {
          201: { description: 'Producto creado' },
          401: { description: 'Token inválido' },
          403: { description: 'Solo administradores' }
        }
      }
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Obtener detalle de un producto',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Detalle del producto',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' }
              }
            }
          },
          404: { description: 'Producto no encontrado' }
        }
      }
    },
    '/products/{productId}/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'Listar reseñas públicas de un producto',
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }
        ],
        responses: {
          200: {
            description: 'Reseñas con paginación',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Review' }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        currentPage: { type: 'integer' },
                        pageSize: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        totalReviews: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Listar categorías activas',
        responses: {
          200: {
            description: 'Listado de categorías',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Category' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Categories'],
        summary: 'Crear categoría (solo admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' }
            }
          }
        },
        responses: {
          201: { description: 'Categoría creada' },
          403: { description: 'Solo administradores' }
        }
      }
    },
    '/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Obtener carrito del usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Carrito actual',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Cart' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Cart'],
        summary: 'Vaciar carrito',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Carrito vaciado' }
        }
      }
    },
    '/cart/add': {
      post: {
        tags: ['Cart'],
        summary: 'Agregar producto al carrito',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Producto agregado al carrito' },
          400: { description: 'Stock insuficiente o datos inválidos' }
        }
      }
    },
    '/cart/update': {
      put: {
        tags: ['Cart'],
        summary: 'Actualizar cantidad de un producto en el carrito',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity'],
                properties: {
                  quantity: { type: 'integer', minimum: 0 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Cantidad actualizada' },
          400: { description: 'Cantidad inválida o producto inexistente' }
        }
      }
    },
    '/cart/remove/{productId}': {
      delete: {
        tags: ['Cart'],
        summary: 'Eliminar producto del carrito',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Producto eliminado del carrito' }
        }
      }
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Listar órdenes (propias o todas si es admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Listado de órdenes',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Order' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Orders'],
        summary: 'Crear orden desde payload directo',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['products', 'shippingAddress'],
                properties: {
                  products: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['product', 'quantity'],
                      properties: {
                        product: { type: 'string' },
                        quantity: { type: 'integer', minimum: 1 }
                      }
                    }
                  },
                  shippingAddress: { $ref: '#/components/schemas/ShippingAddress' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Orden creada' },
          400: { description: 'Stock insuficiente o datos inválidos' }
        }
      }
    },
    '/orders/from-cart': {
      post: {
        tags: ['Orders'],
        summary: 'Crear orden a partir del carrito del usuario',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['shippingAddress'],
                properties: {
                  shippingAddress: { $ref: '#/components/schemas/ShippingAddress' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Orden creada desde el carrito' },
          400: { description: 'Carrito vacío o stock insuficiente' }
        }
      }
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Obtener detalle de orden',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Detalle de la orden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' }
              }
            }
          },
          404: { description: 'Orden no encontrada' }
        }
      }
    },
    '/orders/{id}/status': {
      put: {
        tags: ['Orders'],
        summary: 'Actualizar estado de una orden',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Estado actualizado' },
          400: { description: 'Estado inválido' }
        }
      }
    },
    '/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'Listar reseñas (solo admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'includeInactive', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          200: {
            description: 'Listado de reseñas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Review' }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        currentPage: { type: 'integer' },
                        pageSize: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        totalReviews: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          },
          403: { description: 'Solo administradores' }
        }
      },
      post: {
        tags: ['Reviews'],
        summary: 'Crear reseña (requiere compra previa)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewInput' }
            }
          }
        },
        responses: {
          201: { description: 'Reseña creada' },
          400: { description: 'Validación fallida' }
        }
      }
    },
    '/reviews/my-reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'Listar reseñas del usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Reseñas del usuario',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Review' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/reviews/{id}': {
      put: {
        tags: ['Reviews'],
        summary: 'Actualizar reseña propia',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  comment: { type: 'string', maxLength: 500 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Reseña actualizada' },
          403: { description: 'Solo autor o admin' }
        }
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Eliminar reseña (autor o admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Reseña eliminada lógicamente' },
          403: { description: 'Solo autor o admin' }
        }
      }
    }
  }
};

export default swaggerSpec;
