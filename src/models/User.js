import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Campos de perfil adicionales
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  birthDate: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['masculino', 'femenino', 'otro', 'prefiero no decirlo'],
    default: 'prefiero no decirlo'
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/dki6gqomv/image/upload/v1/default-avatar.png'
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para crear token de recuperación de contraseña
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Expira en 10 minutos
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Método para crear token de verificación de email
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Expira en 24 horas
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Método para verificar contraseña
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export default mongoose.model('User', userSchema);
