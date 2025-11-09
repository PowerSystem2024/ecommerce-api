# 🛍️ Ecommerce Backend API

> Backend profesional para ecommerce de tienda de ropa construido con Node.js, Express y MongoDB. 
> Incluye autenticación JWT, gestión de productos, carrito de compras, órdenes, reseñas y panel de administración.

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-orange.svg)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Docs-Swagger-85EA2D.svg)](https://swagger.io/)
[![MercadoPago](https://img.shields.io/badge/Payment-MercadoPago-00B1EA.svg)](https://www.mercadopago.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Características

### 🔐 Autenticación y Usuarios
- Registro y autenticación de usuarios
- Recuperación de contraseña vía email
- Perfiles de usuario con avatares
- Roles de usuario (admin, cliente)
- Autenticación JWT con refresh tokens

### 🛍️ Productos y Categorías
- Gestión CRUD de productos
- Búsqueda y filtrado avanzado
- Categorías y subcategorías
- Valoraciones y reseñas
- Gestión de inventario

### 🛒 Carrito y Órdenes
- Carrito de compras persistente
- Proceso de checkout
- Integración con MercadoPago
- Historial de pedidos
- Seguimiento de envíos

### 📊 Panel de Administración
- Dashboard con métricas
- Gestión de usuarios
- Reportes de ventas
- Gestión de inventario
- Análisis de productos más vendidos

### 🛠️ Tecnologías Principales
- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticación
- Cloudinary para almacenamiento de imágenes
- Swagger para documentación de la API

## 🏗️ Estructura del Proyecto

```
ecommerce-api/
├── src/
│   ├── config/           # Configuraciones
│   │   ├── db.js         # Conexión a MongoDB
│   │   ├── swagger.js    # Documentación de la API
│   │   └── cloudinary.js # Configuración de Cloudinary
│   │   └── mercadoPago.js # Configuración de mercado pago
│   │
│   ├── controllers/      # Controladores de rutas
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   │
│   ├── services/         # Lógica de negocio
│   ├── repositories/     # Acceso a datos
│   ├── models/           # Modelos de MongoDB
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── routes/           # Rutas de la API
│   ├── middlewares/      # Middlewares
│   │   ├── auth.js       # Autenticación
│   │   └── error.js      # Manejo de errores
│   └── utils/            # Utilidades
│       ├── emailService.js
│       └── validators/
│
├── package.json         # Dependencias
├── .env                 # Variables de entorno
└── README.md            # Documentación
```

## 🔄 Flujo de la Aplicación

### 1. Autenticación
```
Cliente → POST /api/auth/register → Valida datos → Crea usuario → Genera JWT → Retorna token
```

### 2. Búsqueda de Productos
```
Cliente → GET /api/products?category=ropa&minPrice=10 → Filtra productos → Retorna resultados paginados
```

### 3. Proceso de Compra
```
Añadir al carrito → Verificar stock → Crear orden → Procesar pago → Actualizar inventario → Enviar confirmación
```

### 4. Flujo de Datos (Arquitectura)
```
Request HTTP → Middlewares (CORS, Auth, Validación) → 
Routes → Controllers → Services (Lógica de negocio) → 
Repositories (Acceso a datos) → MongoDB
```

## 🚀 Comenzando

### Requisitos Previos
- Node.js 16+
- MongoDB 5.0+
- npm o yarn
- Cuenta en [Cloudinary](https://cloudinary.com/) para almacenamiento de imágenes
- Cuenta en [MercadoPago](https://www.mercadopago.com/) para pagos (opcional)

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/ecommerce-api.git
   cd ecommerce-api
   ```

2. Instalar dependencias:
   ```bash
   npm install
   # o
   yarn
   ```

3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Luego editar `.env` con tus credenciales.

4. Iniciar el servidor en desarrollo:
   ```bash
   # Modo desarrollo
   npm run dev
   
   # Modo producción
   npm start
   ```

5. Acceder a la documentación de la API:
   ```
   http://localhost:3001/api-docs
   ```

## ⚙️ Configuración

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de Datos
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (usando SendGrid)
EMAIL_FROM=tienda@ecommerce.com
SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=tu_api_key_sendgrid

# MercadoPago (opcional)
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_mp
```

## 🛠️ Tecnologías Utilizadas

| Categoría           | Tecnologías                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| **Backend**         | Node.js, Express, MongoDB, Mongoose                                         |
| **Autenticación**   | JWT, bcrypt, express-rate-limit, helmet, hpp, xss-clean                     |
| **Seguridad**       | CORS, rate limiting, sanitize-html, express-mongo-sanitize, validator       |
| **Pagos**           | MercadoPago API                                                             |
| **Almacenamiento**  | Cloudinary, Multer                                                          |
| **Documentación**   | Swagger/OpenAPI                                                             |
| **Calidad de Código**| ESLint, Prettier, Husky, Lint-staged                                       |
| **Testing**         | Jest, Supertest                                                            |



## 📚 Documentación de la API

La documentación completa de la API está disponible en formato Swagger/OpenAPI. Una vez que el servidor esté en ejecución, puedes acceder a:

- **Documentación Interactiva**: `http://localhost:3001/api-docs`
- **Esquema OpenAPI**: `http://localhost:3001/api-docs.json`

### Autenticación

#### Registro de Usuario
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Ana García",
  "email": "ana@ejemplo.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Respuesta Exitosa (201):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "5f8d0f4d7b1f9c3e4c8f8f8f",
      "name": "Ana García",
      "email": "ana@ejemplo.com",
      "role": "user"
    }
  }
}
```

#### Inicio de Sesión
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "ana@ejemplo.com",
  "password": "password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "5f8d0f4d7b1f9c3e4c8f8f8f",
      "name": "Ana García",
      "email": "ana@ejemplo.com",
      "role": "user"
    }
  }
}
```

## 🛠️ Endpoints Principales

### Productos
- `GET /api/v1/products` - Listar todos los productos (con filtros)
- `GET /api/v1/products/:id` - Obtener un producto por ID
- `POST /api/v1/products` - Crear un nuevo producto (admin)
- `PATCH /api/v1/products/:id` - Actualizar producto (admin)
- `DELETE /api/v1/products/:id` - Eliminar producto (admin)

### Carrito
- `GET /api/v1/cart` - Obtener carrito del usuario
- `POST /api/v1/cart` - Añadir producto al carrito
- `DELETE /api/v1/cart/:productId` - Eliminar producto del carrito

### Órdenes
- `POST /api/v1/orders` - Crear nueva orden
- `GET /api/v1/orders` - Listar órdenes del usuario
- `GET /api/v1/orders/:id` - Obtener detalles de una orden

### Reseñas
- `POST /api/v1/products/:productId/reviews` - Crear reseña
- `GET /api/v1/products/:productId/reviews` - Listar reseñas de un producto
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Usar Token en Headers
```http
Authorization: Bearer {tu_token_aqui}
```

### Rutas Protegidas
```http
GET /api/users/profile
PUT /api/users/profile
GET /api/users
```

**Todas requieren header:**
```http
Authorization: Bearer {token}
```

## Instalación y Configuración

### 1. Clonar repositorio
```bash
git clone <repository-url>
cd ecommerce-backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env`:
```env
```

### 4. Ejecutar aplicación
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

## Responsabilidades por Capa

| **Capa** | **Responsabilidad** | **Ejemplo** |
|----------|--------------------|--------------|
| **Controllers** | Manejo HTTP requests/responses | Recibir datos, validar, responder |
| **Services** | Lógica de negocio pura | Encriptar password, generar JWT |
| **Repositories** | Operaciones CRUD de BD | findByEmail, create, update |
| **Models** | Esquemas y validaciones | Definir estructura User |
| **Middlewares** | Funciones transversales | Verificar JWT, manejar errores |
| **Utils** | Utilidades reutilizables | Validaciones Joi, helpers |

## Seguridad Implementada

- **Contraseñas encriptadas** con bcrypt (hash irreversible)
- **Autenticación JWT** stateless
- **Validación de datos** con Joi
- **CORS configurado** para requests cross-origin
- **Manejo de errores** centralizado
- **Variables de entorno** para datos sensibles


## 🛍️ Flujo de Compra Completo

### 1. 🛒 Carrito de Compras
- Los usuarios pueden añadir productos al carrito
- El carrito se guarda en la base de datos
- Se puede modificar cantidades y eliminar productos
- Se calculan totales automáticamente

### 2. 📦 Checkout
1. Verificación de stock
2. Cálculo de totales
3. Selección de dirección de envío
4. Selección de método de pago
5. Confirmación de la orden

### 3. 💳 Procesamiento de Pago
- Integración con MercadoPago
- Diferentes métodos de pago
- Confirmación instantánea
- Notificaciones de estado

### 4. 🚚 Seguimiento de Pedido
- Estados: Procesando, Enviado, En tránsito, Entregado
- Actualizaciones en tiempo real
- Notificaciones por email
- Código de seguimiento

## 🧪 Pruebas

El proyecto incluye pruebas unitarias y de integración:

```bash
# Ejecutar pruebas
npm test

# Ejecutar pruebas con cobertura
npm run test:coverage
```

## 🚀 Despliegue

### Requisitos para Producción
- Servidor con Node.js 16+
- Base de datos MongoDB (Atlas recomendado)
- Servidor SMTP para correos
- CDN para imágenes (Cloudinary)

### Pasos para Despliegue
1. Configurar variables de entorno en producción
2. Construir la aplicación: `npm run build`
3. Iniciar el servidor: `npm start`
4. Configurar proxy inverso (Nginx/Apache)
5. Configurar SSL (Let's Encrypt)

## 🤝 Contribución

1. Haz un Fork del proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit de tus cambios: `git commit -m 'Añade nueva funcionalidad'`
4. Haz push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

- **Email**: soporte@ecommerce.com
- **Sitio Web**: https://ecommerce.com
- **Twitter**: [@ecommerce](https://twitter.com/ecommerce)

---

<div align="center">
  Hecho con ❤️ por el equipo de E-commerce
</div>
- Agregar/remover productos
- Actualizar cantidades
- Validación de stock
- Cálculo automático de totales

### 📋 Órdenes
- Crear orden desde carrito
- Estados: pendiente → confirmada → enviada → entregada
- Seguimiento completo
- Historial de compras

### 📦 Gestión de Stock
- Validación automática de stock
- Actualización al crear órdenes
- Prevención de sobreventa

**Ver documentación completa:** [FLUJO_COMPRA.md](./FLUJO_COMPRA.md)

## Próximos Pasos

- [x] Flujo completo de compra implementado
- [x] Sistema de carrito y órdenes
- [x] Seguimiento de estados
- [ ] Agregar documentación Swagger
- [ ] Deploy a producción
- [ ] Sistema de notificaciones

## Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request


---
**Equipo de Desarrollo** | **Fatal-error**

---
