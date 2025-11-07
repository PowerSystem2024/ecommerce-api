import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada'],
    default: 'pendiente'
  },
  paymentId: {
    type: String
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'refunded', 'charged_back'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    zipCode: String,
    country: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);
