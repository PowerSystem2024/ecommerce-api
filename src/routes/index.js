import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';
import orderRoutes from './orderRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import cartRoutes from './cartRoutes.js';

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);      // Rutas de autenticación
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes); // Rutas de valoraciones y reseñas
router.use('/cart', cartRoutes);      // Rutas del carrito de compras

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default router;
