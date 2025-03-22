import mongoose, { Schema } from 'mongoose';
import { IOrder } from './order.interface';

const productSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new Schema(
  {
    items: productSchema,
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
      required: true,
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
    paymentMethod: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

// Create the Order Model
const Order = mongoose.model<IOrder & Document>('Order', orderSchema);
