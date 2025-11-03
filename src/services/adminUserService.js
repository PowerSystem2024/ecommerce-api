import User from '../models/User.js';

/**
 * Servicio de Gestión de Usuarios para Admin
 * Responsabilidad: Lógica de negocio para administración de usuarios
 * Principio SOLID: Single Responsibility - Solo maneja operaciones admin de usuarios
 */
class AdminUserService {
  /**
   * Obtiene todos los usuarios con paginación y filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Object} Lista de usuarios paginada
   */
  async getAllUsers(filters = {}) {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search
    } = filters;

    // Construir query de filtros
    const query = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtiene un usuario por ID con información completa
   * @param {String} userId - ID del usuario
   * @returns {Object} Usuario
   */
  async getUserById(userId) {
    const user = await User.findById(userId)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
      .lean();

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Actualiza el rol de un usuario
   * @param {String} userId - ID del usuario
   * @param {String} newRole - Nuevo rol ('user' o 'admin')
   * @returns {Object} Usuario actualizado
   */
  async updateUserRole(userId, newRole) {
    // Validar rol
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Rol inválido. Debe ser uno de: ${validRoles.join(', ')}`);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Evitar que un admin se quite a sí mismo el rol de admin
    if (user.role === 'admin' && newRole === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        throw new Error('No se puede degradar al único administrador del sistema');
      }
    }

    user.role = newRole;
    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };
  }

  /**
   * Actualiza el estado activo/inactivo de un usuario
   * @param {String} userId - ID del usuario
   * @param {Boolean} isActive - Estado activo
   * @returns {Object} Usuario actualizado
   */
  async updateUserStatus(userId, isActive) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Evitar desactivar al único admin
    if (user.role === 'admin' && !isActive) {
      const activeAdminCount = await User.countDocuments({ 
        role: 'admin', 
        isActive: true,
        _id: { $ne: userId }
      });
      
      if (activeAdminCount === 0) {
        throw new Error('No se puede desactivar al único administrador activo del sistema');
      }
    }

    user.isActive = isActive;
    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };
  }

  /**
   * Obtiene estadísticas de usuarios
   * @returns {Object} Estadísticas
   */
  async getUserStats() {
    const [totalUsers, activeUsers, adminUsers, usersByRole] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
  }
}

export default new AdminUserService();
