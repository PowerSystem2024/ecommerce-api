import userRepo from '../repositories/userRepo.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class UserService {
  async registerUser(userData) {
    // Verificar si el usuario ya existe
    const existingUser = await userRepo.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    return await userRepo.create(userData);
  }

  async loginUser(email, password) {
    const user = await userRepo.findByEmailWithPassword(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    const token = this.generateToken(user._id);
    return { user: { ...user.toObject(), password: undefined }, token };
  }

  async getUserById(id) {
    const user = await userRepo.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async updateUser(id, updateData) {
    return await userRepo.update(id, updateData);
  }

  async getAllUsers() {
    return await userRepo.findAll();
  }

  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }
}

export default new UserService();
