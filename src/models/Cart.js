import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Middleware para calcular el total antes de guardar
cartSchema.pre('save', async function(next) {
  if (this.items.length === 0) {
    this.totalAmount = 0;
    return next();
  }

  let total = 0;
  for (const item of this.items) {
    const product = await mongoose.model('Product').findById(item.product);
    if (product) {
      total += product.price * item.quantity;
    }
  }
  this.totalAmount = total;
  next();
});

export default mongoose.model('Cart', cartSchema);
