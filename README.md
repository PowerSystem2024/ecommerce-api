# Ecommerce Backend API

> Backend profesional para ecommerce de tienda de ropa construido con Node.js, Express y MongoDB.

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-orange.svg)](https://jwt.io/)

## Características 

- **Arquitectura en Capas** con patrón Repository
- **Autenticación JWT** con encriptación bcrypt
- **Validación de datos** con Joi
- **Middleware de seguridad** y manejo de errores
- **Integración MercadoPago** para pagos
- **MongoDB Atlas** como base de datos
- **API RESTful** con endpoints completos

## Arquitectura del Proyecto

```
ecommerce-backend/
├── src/
│   ├── config/          # Configuraciones (DB, MercadoPago)
│   ├── controllers/     # Manejo de HTTP requests
│   ├── services/        # Lógica de negocio
│   ├── repositories/    # Acceso a datos
│   ├── models/          # Esquemas de MongoDB
│   ├── routes/          # Definición de endpoints
│   ├── middlewares/     # Auth y manejo de errores
│   ├── utils/           # Validaciones y utilidades
│   └── index.js         # Punto de entrada
├── package.json         # Dependencias
├── .env                 # Variables de entorno
└── README.md           # Documentación
```

## Flujo de Arquitectura (Principios SOLID)

```
Request → Middlewares → Controllers → Services → Repositories → MongoDB
```

1. **Request HTTP** llega al servidor Express
2. **Middlewares** procesan CORS, autenticación JWT y validación
3. **Routes** direccionan a los controllers apropiados
4. **Controllers** reciben req/res y delegan a services
5. **Services** ejecutan lógica de negocio pura
6. **Repositories** manejan operaciones CRUD de base de datos
7. **Response** formateada se envía al cliente

## Stack Tecnológico

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|---------|----------|
| **Runtime** | Node.js | 16+ | Entorno de ejecución |
| **Framework** | Express.js | ^4.18.2 | Servidor web |
| **Base de Datos** | MongoDB + Mongoose | ^7.5.0 | NoSQL + ODM |
| **Autenticación** | JWT + bcrypt | ^9.0.2 | Tokens + encriptación |
| **Validación** | Joi | ^17.9.2 | Validación de esquemas |
| **Pagos** | MercadoPago | ^1.5.17 | Procesamiento de pagos |
| **Seguridad** | CORS | ^2.8.5 | Cross-origin requests |
| **Variables** | dotenv | ^16.3.1 | Variables de entorno |



## Autenticación

### Registro de Usuario
```json
POST /api/auth/register
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "mipassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```json
POST /api/auth/login
{
  "email": "juan@email.com",
  "password": "mipassword123"
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


## Próximos Pasos

- [ ] Agregar documentación Swagger
- [ ] Deploy a producción
- [ ] Integración completa MercadoPago
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
