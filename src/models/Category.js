import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas eficientes
categorySchema.index({ name: 1 });

// Middleware para validar eliminación (no eliminar si tiene productos)
categorySchema.pre('findOneAndDelete', async function(next) {
  const categoryId = this.getQuery()._id;
  const Product = mongoose.model('Product');
  const productsCount = await Product.countDocuments({ category: categoryId });
  if (productsCount > 0) {
    const error = new Error('No se puede eliminar la categoría porque tiene productos asociados');
    error.statusCode = 400;
    return next(error);
  }
  next();
});

export default mongoose.model('Category', categorySchema);
