import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import userRepo from '../repositories/userRepo.js';
import { sendEmail } from '../utils/emailService.js';
import { AppError } from '../utils/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthService {
  // Generar token JWT
  signToken(id) {
    return jwt.sign({ id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  }

  // Crear y enviar token
  createSendToken(user, statusCode, res) {
    const token = this.signToken(user._id);

    // Configurar cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };

    // Eliminar la contraseña del output
    user.password = undefined;

    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  }

  // Registro de usuario
  async signup(userData) {
    // 1) Verificar si el usuario ya existe
    const existingUser = await userRepo.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Ya existe un usuario con este correo electrónico', 400);
    }

    // 2) Crear usuario
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      passwordConfirm: userData.passwordConfirm
    });

    // 3) Generar token de verificación de email ANTES de guardar
    const verificationToken = newUser.createEmailVerificationToken();

    // 4) Crear usuario en la BD (con el token ya generado)
    await userRepo.create({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      passwordConfirm: newUser.passwordConfirm,
      emailVerificationToken: newUser.emailVerificationToken,
      emailVerificationExpires: newUser.emailVerificationExpires
    });

    // 5) Enviar email de verificación
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      await sendEmail({
        email: newUser.email,
        subject: 'Verifica tu correo electrónico',
        template: 'emailVerification',
        data: {
          name: newUser.name,
          verificationUrl
        }
      });
    } catch (error) {
      // Si falla el envío del correo, eliminar el usuario creado
      await User.findOneAndDelete({ email: newUser.email });

      throw new AppError(
        'Hubo un error al enviar el correo de verificación. Por favor, inténtalo de nuevo más tarde.',
        500
      );
    }

    return {
      status: 'success',
      message: '¡Registro exitoso! Por favor, verifica tu correo electrónico.',
      data: {
        user: newUser
      }
    };
  }

  // Inicio de sesión
  async login(email, password) {
    // 1) Verificar si el email y la contraseña existen
    if (!email || !password) {
      throw new AppError('Por favor, proporciona correo electrónico y contraseña', 400);
    }

    // 2) Verificar si el usuario existe y la contraseña es correcta
    const user = await userRepo.findByEmailWithPassword(email);

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Correo electrónico o contraseña incorrectos', 401);
    }

    // 3) Verificar si el usuario está activo
    if (!user.isActive) {
      throw new AppError('Tu cuenta ha sido desactivada. Por favor, contacta al soporte.', 401);
    }

    // 4) Generar token
    const token = this.signToken(user._id);

    return {
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    };
  }

  // Olvidé mi contraseña
  async forgotPassword(email) {
    // 1) Verificar si el usuario existe
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new AppError('No existe un usuario con este correo electrónico', 404);
    }

    // 2) Crear token de recuperación
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Enviar email
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      await sendEmail({
        email: user.email,
        subject: 'Recuperación de contraseña',
        template: 'passwordReset',
        data: {
          name: user.name,
          resetUrl
        }
      });

      return {
        message: 'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.'
      };
    } catch (error) {
      // Si falla el envío del correo, eliminar el token
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError(
        'Hubo un error al enviar el correo de recuperación. Por favor, inténtalo de nuevo más tarde.',
        500
      );
    }
  }

  // Restablecer contraseña
  async resetPassword(token, password, passwordConfirm) {
    // 1) Verificar que las contraseñas coincidan
    if (password !== passwordConfirm) {
      throw new AppError('Las contraseñas no coinciden', 400);
    }

    // 2) Encontrar usuario por token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await userRepo.findByResetToken(hashedToken);

    if (!user) {
      throw new AppError('Token inválido o expirado', 400);
    }

    // 3) Verificar que el token no haya expirado
    if (user.passwordResetExpires < Date.now()) {
      throw new AppError('Token expirado. Por favor, solicita uno nuevo.', 400);
    }

    // 4) Actualizar contraseña
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 5) Generar nuevo token JWT
    const jwtToken = this.signToken(user._id);

    return {
      token: jwtToken,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    };
  }

  // Verificar token de restablecimiento
  async verifyResetToken(token) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await userRepo.findByResetToken(hashedToken);

    if (!user) {
      throw new AppError('Token inválido o expirado', 400);
    }

    if (user.passwordResetExpires < Date.now()) {
      throw new AppError('Token expirado', 400);
    }

    return { message: 'Token válido' };
  }

  // Verificar correo electrónico
  async verifyEmail(token) {
    // 1) Encontrar usuario por token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await userRepo.findByEmailVerificationToken(hashedToken);

    if (!user) {
      throw new AppError('Token inválido o expirado', 400);
    }

    // 2) Verificar que el token no haya expirado
    if (user.emailVerificationExpires < Date.now()) {
      throw new AppError('Token expirado. Por favor, solicita uno nuevo.', 400);
    }

    // 3) Marcar como verificado
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return {
      message: 'Correo electrónico verificado correctamente'
    };
  }

  // Reenviar correo de verificación
  async resendVerificationEmail(email) {
    // 1) Verificar si el usuario existe
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new AppError('No existe un usuario con este correo electrónico', 404);
    }

    // 2) Verificar si ya está verificado
    if (user.emailVerificationToken === undefined) {
      throw new AppError('El correo electrónico ya está verificado', 400);
    }

    // 3) Crear nuevo token
    const verificationToken = user.createEmailVerificationToken();

    // 4) Actualizar usuario en la BD con el nuevo token
    await userRepo.update(user._id, {
      emailVerificationToken: user.emailVerificationToken,
      emailVerificationExpires: user.emailVerificationExpires
    });

    // 5) Enviar email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      await sendEmail({
        email: user.email,
        subject: 'Verifica tu correo electrónico',
        template: 'emailVerification',
        data: {
          name: user.name,
          verificationUrl
        }
      });

      return {
        message: 'Se ha enviado un nuevo correo de verificación'
      };
    } catch (error) {
      // Si falla el envío del correo, eliminar el token
      await userRepo.update(user._id, {
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined
      });

      throw new AppError(
        'Hubo un error al enviar el correo de verificación. Por favor, inténtalo de nuevo más tarde.',
        500
      );
    }
  }
}

export default new AuthService();
