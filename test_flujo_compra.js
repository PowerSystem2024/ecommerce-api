/**
 * Script de prueba para el flujo completo de compra
 * 
 * Este script demuestra:
 * 1. Agregar productos al carrito
 * 2. Crear orden desde carrito
 * 3. Actualizar estados de orden
 * 4. Verificar historial de órdenes
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let userId = '';
let productId = '';
let orderId = '';

// Función para hacer requests autenticados
async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${data.message || 'Unknown error'}`);
  }
  
  return data;
}

// Función para registrar un usuario de prueba
async function registerTestUser() {
  console.log('🔐 Registrando usuario de prueba...');
  
  const userData = {
    name: 'Usuario Prueba',
    email: `test${Date.now()}@example.com`,
    password: 'password123'
  };

  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (data.success) {
      authToken = data.data.token;
      userId = data.data.user._id;
      console.log('✅ Usuario registrado:', data.data.user.email);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('❌ Error registrando usuario:', error.message);
    throw error;
  }
}

// Función para obtener un producto de prueba
async function getTestProduct() {
  console.log('📦 Obteniendo productos disponibles...');
  
  try {
    const response = await fetch(`${BASE_URL}/products`);
    const data = await response.json();
    
    if (data.success && data.data.products.length > 0) {
      productId = data.data.products[0]._id;
      console.log('✅ Producto encontrado:', data.data.products[0].name);
    } else {
      throw new Error('No hay productos disponibles');
    }
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error.message);
    throw error;
  }
}

// Función para agregar producto al carrito
async function addToCart() {
  console.log('🛒 Agregando producto al carrito...');
  
  try {
    const data = await apiRequest('/cart/items', 'POST', {
      productId: productId,
      quantity: 2
    });
    
    console.log('✅ Producto agregado al carrito');
    console.log('   Total del carrito:', data.data.totalAmount);
  } catch (error) {
    console.error('❌ Error agregando al carrito:', error.message);
    throw error;
  }
}

// Función para verificar carrito
async function checkCart() {
  console.log('🔍 Verificando carrito...');
  
  try {
    const data = await apiRequest('/cart');
    console.log('✅ Carrito verificado');
    console.log('   Items:', data.data.items.length);
    console.log('   Total:', data.data.totalAmount);
  } catch (error) {
    console.error('❌ Error verificando carrito:', error.message);
    throw error;
  }
}

// Función para crear orden desde carrito
async function createOrderFromCart() {
  console.log('📋 Creando orden desde carrito...');
  
  try {
    const data = await apiRequest('/orders/from-cart', 'POST', {
      shippingAddress: {
        street: 'Calle de Prueba 123',
        city: 'Ciudad de Prueba',
        zipCode: '12345',
        country: 'País de Prueba'
      }
    });
    
    orderId = data.data._id;
    console.log('✅ Orden creada:', orderId);
    console.log('   Estado:', data.data.status);
    console.log('   Total:', data.data.totalAmount);
  } catch (error) {
    console.error('❌ Error creando orden:', error.message);
    throw error;
  }
}

// Función para verificar que el carrito se vació
async function verifyCartEmptied() {
  console.log('🔍 Verificando que el carrito se vació...');
  
  try {
    const data = await apiRequest('/cart');
    if (data.data.items.length === 0) {
      console.log('✅ Carrito vaciado correctamente');
    } else {
      console.log('⚠️  El carrito no se vació completamente');
    }
  } catch (error) {
    console.error('❌ Error verificando carrito:', error.message);
  }
}

// Función para actualizar estado de orden
async function updateOrderStatus(status) {
  console.log(`📝 Actualizando estado de orden a: ${status}...`);
  
  try {
    const data = await apiRequest(`/orders/${orderId}/status`, 'PUT', {
      status: status
    });
    
    console.log('✅ Estado actualizado:', data.data.status);
  } catch (error) {
    console.error('❌ Error actualizando estado:', error.message);
    throw error;
  }
}

// Función para ver historial de órdenes
async function checkOrderHistory() {
  console.log('📚 Verificando historial de órdenes...');
  
  try {
    const data = await apiRequest('/orders');
    console.log('✅ Historial de órdenes:');
    console.log('   Total de órdenes:', data.data.length);
    
    data.data.forEach((order, index) => {
      console.log(`   Orden ${index + 1}: ${order._id} - ${order.status} - $${order.totalAmount}`);
    });
  } catch (error) {
    console.error('❌ Error verificando historial:', error.message);
    throw error;
  }
}

// Función para ver detalle de orden
async function checkOrderDetail() {
  console.log('🔍 Verificando detalle de orden...');
  
  try {
    const data = await apiRequest(`/orders/${orderId}`);
    console.log('✅ Detalle de orden:');
    console.log('   ID:', data.data._id);
    console.log('   Estado:', data.data.status);
    console.log('   Total:', data.data.totalAmount);
    console.log('   Productos:', data.data.products.length);
    console.log('   Fecha:', data.data.createdAt);
  } catch (error) {
    console.error('❌ Error verificando detalle:', error.message);
    throw error;
  }
}

// Función principal que ejecuta todo el flujo
async function runCompleteFlow() {
  console.log('🚀 Iniciando flujo completo de compra...\n');
  
  try {
    // 1. Registrar usuario
    await registerTestUser();
    console.log('');
    
    // 2. Obtener producto
    await getTestProduct();
    console.log('');
    
    // 3. Agregar al carrito
    await addToCart();
    console.log('');
    
    // 4. Verificar carrito
    await checkCart();
    console.log('');
    
    // 5. Crear orden desde carrito
    await createOrderFromCart();
    console.log('');
    
    // 6. Verificar que el carrito se vació
    await verifyCartEmptied();
    console.log('');
    
    // 7. Ver historial de órdenes
    await checkOrderHistory();
    console.log('');
    
    // 8. Ver detalle de orden
    await checkOrderDetail();
    console.log('');
    
    // 9. Actualizar estados de orden
    await updateOrderStatus('confirmada');
    console.log('');
    
    await updateOrderStatus('enviada');
    console.log('');
    
    await updateOrderStatus('entregada');
    console.log('');
    
    // 10. Verificar historial final
    await checkOrderHistory();
    console.log('');
    
    console.log('🎉 ¡Flujo completo de compra ejecutado exitosamente!');
    
  } catch (error) {
    console.error('💥 Error en el flujo:', error.message);
    process.exit(1);
  }
}

// Ejecutar el flujo si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteFlow();
}

export { runCompleteFlow };
