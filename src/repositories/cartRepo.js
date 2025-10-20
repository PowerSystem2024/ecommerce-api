import Cart from '../models/Cart.js';

class CartRepository {
  async create(cartData) {
    return await Cart.create(cartData);
  }

  async findByUserId(userId) {
    return await Cart.findOne({ user: userId }).populate('items.product');
  }

  async updateByUserId(userId, updateData) {
    return await Cart.findOneAndUpdate(
      { user: userId }, 
      updateData, 
      { new: true, upsert: true }
    ).populate('items.product');
  }

  async addItem(userId, productId, quantity) {
    const cart = await this.findByUserId(userId);
    
    if (!cart) {
      // Crear nuevo carrito
      return await this.create({
        user: userId,
        items: [{ product: productId, quantity }]
      });
    }

    // Verificar si el producto ya existe en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.product._id.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Actualizar cantidad
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Agregar nuevo item
      cart.items.push({ product: productId, quantity });
    }

    return await cart.save();
  }

  async updateItemQuantity(userId, productId, quantity) {
    const cart = await this.findByUserId(userId);
    
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    const itemIndex = cart.items.findIndex(
      item => item.product._id.toString() === productId
    );

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remover item si la cantidad es 0 o menor
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      return await cart.save();
    } else {
      throw new Error('Producto no encontrado en el carrito');
    }
  }

  async removeItem(userId, productId) {
    const cart = await this.findByUserId(userId);
    
    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    cart.items = cart.items.filter(
      item => item.product._id.toString() !== productId
    );

    return await cart.save();
  }

  async clearCart(userId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalAmount: 0 },
      { new: true }
    );
  }

  async deleteByUserId(userId) {
    return await Cart.findOneAndDelete({ user: userId });
  }
}

export default new CartRepository();
