import mongoose, { Schema } from 'mongoose';
import { IOrder } from './order.interface';
import generateOrderNumber from '../../../utils/genarateOrderNumber';

const orderSchema = new Schema<IOrder>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    confirmBybyer: {
      type: Boolean,
      required: true,
      default: false,
    },
    confirmByseller: {
      type: Boolean,
      required: true,
      default: false,
    },
    orderNumber: {
      type: String,
      default: function () {
        return generateOrderNumber('ord-');
      },
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Create the Order Model
export const Order = mongoose.model<IOrder>('Order', orderSchema);
