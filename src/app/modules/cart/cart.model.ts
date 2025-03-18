import mongoose, { Schema } from 'mongoose';
import { ICart, CartItem } from './cart.interface';

const cartItemSchema = new Schema<CartItem>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const cartSchema = new Schema<ICart>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [cartItemSchema],
  totalPrice: { type: Number, default: 0 },
});

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
