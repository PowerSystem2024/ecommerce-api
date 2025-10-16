// Importa mongoose para definir esquemas y modelos de MongoDB
import mongoose from 'mongoose';

// Esquema para cada ítem del carrito
const cartItemSchema = new mongoose.Schema({
  // Referencia al producto en la colección Product
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // Cantidad de ese producto en el carrito
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

// Esquema principal del carrito
const cartSchema = new mongoose.Schema({
  // Usuario dueño del carrito (referencia a User)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Un carrito por usuario
  },
  // Array de ítems en el carrito
  items: [cartItemSchema],
  // Fecha de creación del carrito
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Fecha de última actualización
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar la fecha de modificación cada vez que se guarda el carrito
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Exporta el modelo Cart para usarlo en otras partes del backend
export default mongoose.model('Cart', cartSchema);