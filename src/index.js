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

const allowedOrigins = (
  process.env.CORS_ALLOWED_ORIGINS ||
  process.env.FRONTEND_URL ||
  'http://localhost:5173'
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Configuración de CORS
const corsOptions = {
  origin(requestOrigin, callback) {
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      callback(null, true);
      return;
    }

callback(new Error(`Origen no permitido por CORS: ${requestOrigin}`));
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

// Routes
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  // Server started successfully
});