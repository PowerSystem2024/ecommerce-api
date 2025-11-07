import express from 'express';
import dashboardController from '../controllers/dashboardCtrl.js';
import adminUserController from '../controllers/adminUserCtrl.js';
import adminOrderController from '../controllers/adminOrderCtrl.js';
import adminReviewController from '../controllers/adminReviewCtrl.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Todas las rutas de admin requieren autenticación y rol de administrador
 * Aplicamos los middlewares a todas las rutas del router
 */
router.use(authenticateToken, isAdmin);

/**
 * Dashboard y Estadísticas
 */
// GET /api/admin/dashboard - Estadísticas generales
router.get('/dashboard', dashboardController.getStats);

// GET /api/admin/sales-report - Reporte de ventas
router.get('/sales-report', dashboardController.getSalesReport);

/**
 * Gestión de Usuarios
 */
// GET /api/admin/users/stats - Estadísticas de usuarios (debe ir antes de /:id)
router.get('/users/stats', adminUserController.getUserStats);

// GET /api/admin/users/deleted - Listar usuarios eliminados (debe ir antes de /:id)
router.get('/users/deleted', adminUserController.getDeletedUsers);

// GET /api/admin/users - Listar todos los usuarios
router.get('/users', adminUserController.getAllUsers);

// GET /api/admin/users/:id - Obtener usuario por ID
router.get('/users/:id', adminUserController.getUserById);

// PUT /api/admin/users/:id/role - Actualizar rol de usuario
router.put('/users/:id/role', adminUserController.updateUserRole);

// PUT /api/admin/users/:id/status - Actualizar estado de usuario
router.put('/users/:id/status', adminUserController.updateUserStatus);

// PUT /api/admin/users/:id - Actualizar información completa de usuario
router.put('/users/:id', adminUserController.updateUser);

// DELETE /api/admin/users/:id - Eliminación lógica de usuario
router.delete('/users/:id', adminUserController.deleteUser);

// POST /api/admin/users/:id/restore - Restaurar usuario eliminado
router.post('/users/:id/restore', adminUserController.restoreUser);

/**
 * Gestión de Órdenes
 */
// GET /api/admin/orders/stats - Estadísticas de órdenes (debe ir antes de /:id)
router.get('/orders/stats', adminOrderController.getOrderStats);

// GET /api/admin/orders/recent - Órdenes recientes (debe ir antes de /:id)
router.get('/orders/recent', adminOrderController.getRecentOrders);

// GET /api/admin/orders - Listar todas las órdenes
router.get('/orders', adminOrderController.getAllOrders);

// GET /api/admin/orders/:id - Obtener orden por ID
router.get('/orders/:id', adminOrderController.getOrderById);

// PUT /api/admin/orders/:id/status - Actualizar estado de orden
router.put('/orders/:id/status', adminOrderController.updateOrderStatus);

/**
 * Gestión de Reseñas
 */
// GET /api/admin/reviews/stats - Estadísticas de reseñas (debe ir antes de /:id)
router.get('/reviews/stats', adminReviewController.getReviewStats);

// GET /api/admin/reviews/recent - Reseñas recientes (debe ir antes de /:id)
router.get('/reviews/recent', adminReviewController.getRecentReviews);

// GET /api/admin/reviews - Listar todas las reseñas
router.get('/reviews', adminReviewController.getAllReviews);

// GET /api/admin/reviews/:id - Obtener reseña por ID
router.get('/reviews/:id', adminReviewController.getReviewById);

// PUT /api/admin/reviews/:id/status - Actualizar estado de reseña
router.put('/reviews/:id/status', adminReviewController.updateReviewStatus);

// DELETE /api/admin/reviews/:id - Eliminar reseña
router.delete('/reviews/:id', adminReviewController.deleteReview);

export default router;
