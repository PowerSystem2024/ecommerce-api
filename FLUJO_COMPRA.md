# Flujo Completo de Compra - Ecommerce API

## Descripción
Este documento describe el flujo completo de compra desde el carrito hasta la generación de órdenes, con seguimiento de estados y historial para usuarios.

## Entidades Principales

### 1. Cart (Carrito)
- **Modelo**: `src/models/Cart.js`
- **Repository**: `src/repositories/cartRepo.js`
- **Service**: `src/services/cartService.js`
- **Controller**: `src/controllers/cartCtrl.js`
- **Rutas**: `src/routes/cartRoutes.js`

### 2. Order (Orden)
- **Modelo**: `src/models/Order.js`
- **Repository**: `src/repositories/orderRepo.js`
- **Service**: `src/services/orderService.js`
- **Controller**: `src/controllers/orderCtrl.js`
- **Rutas**: `src/routes/orderRoutes.js`

## Estados de Orden
- `pendiente`: Orden creada, esperando confirmación
- `confirmada`: Orden confirmada y pagada
- `enviada`: Orden enviada al cliente
- `entregada`: Orden entregada al cliente
- `cancelada`: Orden cancelada

## Endpoints Disponibles

### Carrito de Compras

#### GET /api/cart
Obtener el carrito del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "_id": "cart_id",
    "user": "user_id",
    "items": [
      {
        "product": {
          "_id": "product_id",
          "name": "Producto",
          "price": 100
        },
        "quantity": 2
      }
    ],
    "totalAmount": 200
  }
}
```

#### POST /api/cart/items
Agregar producto al carrito.

**Body:**
```json
{
  "productId": "product_id",
  "quantity": 2
}
```

#### PUT /api/cart/items/:productId
Actualizar cantidad de producto en el carrito.

**Body:**
```json
{
  "quantity": 3
}
```

#### DELETE /api/cart/items/:productId
Remover producto del carrito.

#### DELETE /api/cart
Vaciar carrito completamente.

### Órdenes

#### POST /api/orders/from-cart
Crear orden desde el carrito (recomendado).

**Body:**
```json
{
  "shippingAddress": {
    "street": "Calle 123",
    "city": "Ciudad",
    "zipCode": "12345",
    "country": "País"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "_id": "order_id",
    "user": "user_id",
    "products": [...],
    "totalAmount": 200,
    "status": "pendiente",
    "shippingAddress": {...},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/orders
Obtener órdenes del usuario (o todas si es admin).

#### GET /api/orders/:id
Obtener detalle de una orden específica.

#### PUT /api/orders/:id/status
Actualizar estado de una orden.

**Body:**
```json
{
  "status": "confirmada"
}
```

## Flujo Completo de Compra

### 1. Agregar Productos al Carrito
```bash
# Agregar producto al carrito
POST /api/cart/items
{
  "productId": "product_id",
  "quantity": 2
}

# Verificar carrito
GET /api/cart
```

### 2. Crear Orden desde Carrito
```bash
# Crear orden desde carrito
POST /api/orders/from-cart
{
  "shippingAddress": {
    "street": "Calle 123",
    "city": "Ciudad",
    "zipCode": "12345",
    "country": "País"
  }
}
```

**Lo que sucede automáticamente:**
- ✅ Se valida el stock de todos los productos
- ✅ Se calcula el total de la orden
- ✅ Se crea la orden con estado "pendiente"
- ✅ Se resta el stock de los productos
- ✅ Se vacía el carrito del usuario

### 3. Seguimiento de Estados
```bash
# Ver historial de órdenes
GET /api/orders

# Ver detalle de orden específica
GET /api/orders/:id

# Actualizar estado (admin)
PUT /api/orders/:id/status
{
  "status": "confirmada"
}
```

## Validaciones Implementadas

### Carrito
- ✅ Verificar que el producto existe y está activo
- ✅ Verificar stock disponible antes de agregar
- ✅ Validar cantidades positivas
- ✅ Calcular total automáticamente

### Órdenes
- ✅ Validar stock antes de crear orden
- ✅ Verificar que el carrito no esté vacío
- ✅ Validar dirección de envío
- ✅ Estados de orden válidos
- ✅ Restar stock automáticamente
- ✅ Vaciar carrito después de crear orden

## Casos de Error

### Stock Insuficiente
```json
{
  "success": false,
  "message": "Stock insuficiente para el producto product_id"
}
```

### Carrito Vacío
```json
{
  "success": false,
  "message": "El carrito está vacío"
}
```

### Estado Inválido
```json
{
  "success": false,
  "message": "Estado de orden inválido"
}
```

## Integración con MercadoPago

El sistema incluye integración con MercadoPago para procesamiento de pagos:

```bash
# Crear preferencia de pago
POST /api/orders/:id/payment
```

## Notas Técnicas

- **Transacciones**: El sistema maneja la consistencia de datos al crear órdenes
- **Stock**: Se valida y actualiza automáticamente
- **Carrito**: Se vacía automáticamente después de crear orden
- **Estados**: Flujo completo de seguimiento de órdenes
- **Validaciones**: Esquemas Joi para validación de entrada
- **Autenticación**: Todos los endpoints requieren autenticación
- **Autorización**: Los usuarios solo ven sus propias órdenes (excepto admins)
