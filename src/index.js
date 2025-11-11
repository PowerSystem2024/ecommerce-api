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

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://ecommerce-front-nine-nu.vercel.app',
  ...(process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim()) : []),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
].filter(Boolean);

console.log('Orígenes permitidos:', allowedOrigins);

// Configuración de CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está en la lista de permitidos
    if (allowedOrigins.includes(origin) || 
        allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))) {
      return callback(null, true);
    }
    
    console.log('Origen no permitido:', origin);
    console.log('Orígenes permitidos:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'));
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
    message: 'Bienvenido a la API de E-commerce',
    documentation: '/api/docs',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Montar todas las rutas bajo /api
app.use('/api', routes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente', timestamp: new Date().toISOString() });
});

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  // Server started successfully
});