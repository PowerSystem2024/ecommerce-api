import dotenv from 'dotenv';

// ✅ Cargar variables de entorno PRIMERO, antes de cualquier import
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors()); // CORS
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded

// Routes
app.use('/api', routes);

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  // Server started successfully
});
