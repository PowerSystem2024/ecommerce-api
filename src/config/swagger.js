const swaggerSpec = {
  openapi: '3.0.1',
  info: {
    title: 'Ecommerce API',
    version: '1.0.1',
    description: `API de ecommerce para tienda de ropa. Incluye:
- Autenticación JWT con refresh tokens
- Gestión de productos y categorías
- Carrito de compras
- Proceso de checkout con MercadoPago
- Sistema de reseñas
- Panel de administración

Cada endpoint incluye ejemplos de solicitud/respuesta y códigos de error.`,
    contact: {
      name: 'Soporte Técnico',
      email: 'soporte@ecommerce.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
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
    { name: 'Reviews', description: 'Reseñas y valoraciones de productos' },
    { name: 'Users', description: 'Perfil de usuario y avatar' },
    { name: 'Admin', description: 'Panel de administración - Solo administradores' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Incluir el token JWT en el formato: Bearer <token>'
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Token inválido o expirado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              status: 'error',
              message: 'No autorizado. Por favor inicia sesión.'
            }
          }
        }
      },
      BadRequestError: {
        description: 'Datos de entrada inválidos',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              status: 'error',
              message: 'Error de validación',
              errors: [
                {
                  field: 'email',
                  message: 'El correo electrónico es requerido'
                }
              ]
            }
          }
        }
      },
      NotFoundError: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            },
            example: {
              status: 'error',
              message: 'Producto no encontrado'
            }
          }
        }
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['error', 'fail'] },
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success'] },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          totalPages: { type: 'integer' },
          hasNextPage: { type: 'boolean' },
          hasPrevPage: { type: 'boolean' }
        }
      },
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
        required: ['name', 'price', 'category', 'stock'],
        properties: {
          _id: { 
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          name: { 
            type: 'string',
            example: 'Camiseta básica',
            minLength: 3,
            maxLength: 100
          },
          sku: { 
            type: 'string',
            example: 'PROD-001',
            description: 'Código único del producto'
          },
          description: { 
            type: 'string',
            example: 'Camiseta 100% algodón'
          },
          price: { 
            type: 'number',
            minimum: 0,
            example: 29.99
          },
          discountPrice: {
            type: 'number',
            minimum: 0,
            example: 24.99,
            description: 'Precio con descuento (opcional)'
          },
          category: { 
            $ref: '#/components/schemas/Category',
            description: 'Categoría principal del producto'
          },
          stock: { 
            type: 'integer',
            minimum: 0,
            example: 50
          },
          images: {
            type: 'array',
            items: { 
              type: 'string',
              format: 'uri',
              example: 'https://res.cloudinary.com/.../camiseta.jpg'
            },
            minItems: 1,
            description: 'URLs de las imágenes del producto'
          },
          sizes: {
            type: 'array',
            items: { 
              type: 'string',
              enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Única']
            },
            description: 'Tallas disponibles'
          },
          colors: {
            type: 'array',
            items: { 
              type: 'string',
              example: ['rojo', 'azul', 'negro']
            },
            description: 'Colores disponibles'
          },
          tags: {
            type: 'array',
            items: { 
              type: 'string',
              example: ['nuevo', 'oferta', 'verano2023']
            },
            description: 'Etiquetas para búsqueda y filtrado'
          },
          isActive: {
            type: 'boolean',
            default: true,
            description: 'Indica si el producto está disponible para la venta'
          },
          rating: {
            type: 'number',
            minimum: 0,
            maximum: 5,
            example: 4.5,
            description: 'Calificación promedio del producto (0-5)'
          },
          numReviews: {
            type: 'integer',
            minimum: 0,
            example: 24,
            description: 'Número de reseñas del producto'
          },
          featured: {
            type: 'boolean',
            default: false,
            description: 'Producto destacado en la página principal'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
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
    },

    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Obtener perfil del usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Perfil del usuario',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                        phone: { type: 'string' },
                        birthDate: { type: 'string', format: 'date' },
                        gender: { type: 'string' },
                        address: {
                          type: 'object',
                          properties: {
                            street: { type: 'string' },
                            city: { type: 'string' },
                            state: { type: 'string' },
                            postalCode: { type: 'string' },
                            country: { type: 'string' }
                          }
                        },
                        avatar: { type: 'string', format: 'uri' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Token inválido' }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Actualizar perfil del usuario autenticado',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  birthDate: { type: 'string', format: 'date' },
                  gender: { type: 'string', enum: ['masculino', 'femenino', 'otro', 'prefiero no decirlo'] },
                  address: {
                    type: 'object',
                    properties: {
                      street: { type: 'string' },
                      city: { type: 'string' },
                      state: { type: 'string' },
                      postalCode: { type: 'string' },
                      country: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Perfil actualizado' },
          400: { description: 'Datos inválidos' },
          401: { description: 'Token inválido' }
        }
      }
    },

    '/users/upload-avatar': {
      post: {
        tags: ['Users'],
        summary: 'Subir imagen de avatar del usuario',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  avatar: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo de imagen (jpg, png, webp), máx. 5MB'
                  }
                },
                required: ['avatar']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Avatar subido correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: { avatar: { type: 'string', format: 'uri' } }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Archivo inválido o demasiado grande' },
          401: { description: 'Token inválido' }
        }
      }
    },

    // ==================== ADMIN ENDPOINTS ====================
    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener estadísticas generales del dashboard',
        description: 'Retorna métricas generales: usuarios, órdenes, productos, reseñas, ingresos, órdenes recientes y productos más vendidos',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Estadísticas del dashboard',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        totalUsers: { type: 'integer' },
                        totalOrders: { type: 'integer' },
                        totalProducts: { type: 'integer' },
                        totalReviews: { type: 'integer' },
                        totalRevenue: { type: 'number' },
                        averageOrderValue: { type: 'number' },
                        recentOrders: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                        topProducts: { type: 'array', items: { type: 'object' } }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Token inválido' },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/sales-report': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener reporte de ventas por período',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'period',
            in: 'query',
            schema: { type: 'string', enum: ['day', 'week', 'month', 'year'], default: 'month' },
            description: 'Período del reporte'
          }
        ],
        responses: {
          200: {
            description: 'Reporte de ventas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        period: { type: 'string' },
                        dateRange: {
                          type: 'object',
                          properties: {
                            start: { type: 'string', format: 'date-time' },
                            end: { type: 'string', format: 'date-time' }
                          }
                        },
                        data: { type: 'array', items: { type: 'object' } }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Período inválido' },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Listar todos los usuarios con paginación y filtros',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, default: 10 } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['user', 'admin'] } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre o email' }
        ],
        responses: {
          200: {
            description: 'Lista de usuarios',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        pages: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/users/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener estadísticas de usuarios',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Estadísticas de usuarios',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        totalUsers: { type: 'integer' },
                        activeUsers: { type: 'integer' },
                        inactiveUsers: { type: 'integer' },
                        adminUsers: { type: 'integer' },
                        usersByRole: { type: 'object' }
                      }
                    }
                  }
                }
              }
            }
          },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/users/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener usuario por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Usuario encontrado' },
          404: { description: 'Usuario no encontrado' },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/users/{id}/role': {
      put: {
        tags: ['Admin'],
        summary: 'Actualizar rol de usuario',
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
                required: ['role'],
                properties: {
                  role: { type: 'string', enum: ['user', 'admin'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Rol actualizado correctamente' },
          400: { description: 'Rol inválido o no se puede degradar al único admin' },
          404: { description: 'Usuario no encontrado' },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/users/{id}/status': {
      put: {
        tags: ['Admin'],
        summary: 'Activar o desactivar usuario',
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
                required: ['isActive'],
                properties: {
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Estado actualizado correctamente' },
          400: { description: 'No se puede desactivar al único admin activo' },
          404: { description: 'Usuario no encontrado' },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/orders': {
      get: {
        tags: ['Admin'],
        summary: 'Listar todas las órdenes con paginación y filtros',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'] } },
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'minAmount', in: 'query', schema: { type: 'number' } },
          { name: 'maxAmount', in: 'query', schema: { type: 'number' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: {
          200: {
            description: 'Lista de órdenes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                    pagination: { type: 'object' }
                  }
                }
              }
            }
          },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/orders/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener estadísticas de órdenes',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Estadísticas de órdenes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        totalOrders: { type: 'integer' },
                        ordersByStatus: { type: 'object' },
                        totalRevenue: { type: 'number' },
                        averageOrderValue: { type: 'number' },
                        completedOrders: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/orders/recent': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener órdenes recientes',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, default: 10 } }
        ],
        responses: {
          200: {
            description: 'Órdenes recientes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Order' } }
                  }
                }
              }
            }
          },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/orders/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener orden por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Orden encontrada' },
          404: { description: 'Orden no encontrada' },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/orders/{id}/status': {
      put: {
        tags: ['Admin'],
        summary: 'Actualizar estado de orden',
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
                  status: { type: 'string', enum: ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Estado actualizado correctamente' },
          400: { description: 'Estado inválido o transición no permitida' },
          404: { description: 'Orden no encontrada' },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/reviews': {
      get: {
        tags: ['Admin'],
        summary: 'Listar todas las reseñas con paginación y filtros',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, default: 10 } },
          { name: 'rating', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 5 } },
          { name: 'productId', in: 'query', schema: { type: 'string' } },
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: {
          200: {
            description: 'Lista de reseñas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
                    pagination: { type: 'object' }
                  }
                }
              }
            }
          },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/reviews/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener estadísticas de reseñas',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Estadísticas de reseñas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        totalReviews: { type: 'integer' },
                        activeReviews: { type: 'integer' },
                        inactiveReviews: { type: 'integer' },
                        averageRating: { type: 'number' },
                        reviewsByRating: { type: 'object' }
                      }
                    }
                  }
                }
              }
            }
          },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/reviews/recent': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener reseñas recientes',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, default: 10 } }
        ],
        responses: {
          200: {
            description: 'Reseñas recientes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Review' } }
                  }
                }
              }
            }
          },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/reviews/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Obtener reseña por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Reseña encontrada' },
          404: { description: 'Reseña no encontrada' },
          403: { description: 'Solo administradores' }
        }
      },
      delete: {
        tags: ['Admin'],
        summary: 'Eliminar reseña',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Reseña eliminada correctamente' },
          404: { description: 'Reseña no encontrada' },
          403: { description: 'Solo administradores' }
        }
      }
    },

    '/admin/reviews/{id}/status': {
      put: {
        tags: ['Admin'],
        summary: 'Activar o desactivar reseña',
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
                required: ['isActive'],
                properties: {
                  isActive: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Estado actualizado correctamente' },
          404: { description: 'Reseña no encontrada' },
          403: { description: 'Solo administradores' }
        }
      }
    }
  }
};

export default swaggerSpec;
