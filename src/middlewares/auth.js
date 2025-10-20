import jwt from 'jsonwebtoken';
import userService from '../services/userService.js';

/**
 * Middleware de autenticación JWT
 * Verifica que el token sea válido y el usuario exista
 */
const auth = async (req, res, next) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario existe y está activo
    const user = await userService.getUserById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autorizado'
      });
    }

    // Adjuntar información del usuario al request
    req.user = {
      id: decoded.id,
      userId: decoded.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    // Manejo específico de errores JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor inicia sesión nuevamente'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
};

/**
 * Middleware para verificar si el usuario es administrador
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }

  next();
};

// Exportar funciones con nombres específicos
export { auth as authenticateToken, isAdmin };
export default auth;
