import mongoose from 'mongoose';

export interface CartItem {
  productId: mongoose.Schema.Types.ObjectId;
  quantity: number;
}

export interface ICart {
  userId: mongoose.Schema.Types.ObjectId;
  items: CartItem[];
  totalPrice: number;
}
