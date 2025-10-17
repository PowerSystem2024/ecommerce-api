/**
 * Servicio de envío de emails
 * Configuración REAL para Gmail con credenciales de aplicación
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// ✅ Cargar variables de entorno DIRECTAMENTE en este archivo
dotenv.config();

// Configuración específica para Gmail con contraseña de aplicación
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  }
});

// Sistema de emails inicializado correctamente
console.log('📧 Sistema de emails listo - Puerto 3001 activo');
console.log('🗄️  Conexión a MongoDB establecida');

// Función para obtener plantilla HTML según el tipo
const getEmailTemplate = (template, data) => {
  switch (template) {
    case 'emailVerification':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Verifica tu correo electrónico</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a E-commerce API!</h1>
            </div>

            <h2>Hola ${data.name},</h2>

            <p>¡Gracias por registrarte! Para completar tu registro y activar tu cuenta, necesitas verificar tu dirección de correo electrónico.</p>

            <p>Haz clic en el siguiente botón para verificar tu email:</p>

            <p style="text-align: center;">
              <a href="${data.verificationUrl}" class="button">Verificar Email</a>
            </p>

            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p><a href="${data.verificationUrl}">${data.verificationUrl}</a></p>

            <p>Este enlace expirará en 24 horas por seguridad.</p>

            <p>Si no creaste esta cuenta, puedes ignorar este email.</p>

            <div class="footer">
              <p>Este es un email automático, por favor no respondas directamente.</p>
              <p>&copy; 2025 E-commerce API. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'passwordReset':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Recuperación de contraseña</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
            .button { display: inline-block; background: #FF9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Recuperación de Contraseña</h1>
            </div>

            <h2>Hola ${data.name},</h2>

            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>

            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>

            <p style="text-align: center;">
              <a href="${data.resetUrl}" class="button">Restablecer Contraseña</a>
            </p>

            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p><a href="${data.resetUrl}">${data.resetUrl}</a></p>

            <p><strong>Este enlace expirará en 10 minutos por seguridad.</strong></p>

            <p>Si no solicitaste este cambio de contraseña, puedes ignorar este email. Tu contraseña actual permanecerá segura.</p>

            <div class="footer">
              <p>Este es un email automático, por favor no respondas directamente.</p>
              <p>&copy; 2025 E-commerce API. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return `
        <h2>Hola ${data.name},</h2>
        <p>${data.subject || 'Mensaje'}</p>
      `;
  }
};

// Función principal para envío real de email
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"E-commerce API" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: getEmailTemplate(options.template, options.data)
    };

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('Error enviando email:', error);

    // Si hay error de envío, retornamos error pero no rompemos la aplicación
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para verificar conexión
const verifyConnection = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Error verificando conexión SMTP:', error.message);
    return false;
  }
};

// Función alternativa para probar diferentes configuraciones
const createAlternativeTransporter = () => {
  // Opción 1: Gmail con configuración estándar
  const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return gmailTransporter;
};

// Función de prueba rápida para verificar credenciales
const testEmailConnection = async () => {
  try {
    const isConnected = await verifyConnection();
    return isConnected;
  } catch (error) {
    console.error('Error de conexión:', error.message);
    return false;
  }
};

export { sendEmail, createAlternativeTransporter, verifyConnection, testEmailConnection };
