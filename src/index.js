import dotenv from 'dotenv';

// ✅ Cargar variables de entorno PRIMERO, antes de cualquier import
dotenv.config();

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Conectar a la base de datos
connectDB();

// Configuración de CORS
const allowedOrigins = [
  'https://ecommerce-front-venice.vercel.app',  // Tu frontend en producción
  'https://ecommerce-front.vercel.app',         // Otra posible URL de producción
  'http://localhost:5173'                       // Desarrollo local
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin 'origin' (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está en la lista de permitidos
    if (allowedOrigins.indexOf(origin) !== -1 || 
        process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permite el envío de cookies/tokens
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['Content-Range', 'X-Total-Count']
};

// Middlewares
app.use(cors(corsOptions)); // CORS con opciones
app.options('*', cors(corsOptions)); // Manejar preflight para todas las rutas
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bienvenido a la API de E-commerce',
    documentation: '/api/docs',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Documentación de la API
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API
app.use('/api', routes);

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  // Server started successfully
});
