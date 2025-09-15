// TODO: Configurar MercadoPago cuando esté listo
// import pkg from 'mercadopago';
// const { MercadoPagoConfig, Preference } = pkg;

// Configuración temporal - se reemplazará con el módulo real
const client = {
  // Placeholder para MercadoPago client
};

const preference = {
  create: async (data) => {
    console.log('⚠️  MercadoPago no configurado aún - usando mock');
    return { id: 'mock-preference-id' };
  }
};

export { client, preference };
