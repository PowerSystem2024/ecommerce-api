import { MercadoPagoConfig, Payment, Preference, PreApproval } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

export const paymentClient = new Payment(client);
export const preferenceClient = new Preference(client);
export const preApprovalClient = new PreApproval(client);

// Exportar también el appUrl para uso en servicios
export const appUrl = process.env.APP_URL || 'http://localhost:3001';
