import mongoose, { Schema } from 'mongoose';
import { ILiked } from './liked.interface';

const likesSchema = new Schema<ILiked>(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    liked: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Like = mongoose.model<ILiked>('Like', likesSchema);
