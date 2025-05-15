import { model, Schema } from 'mongoose';
import { IReview, ReviewModel } from './review.interface';
import generateOrderNumber from '../../../utils/genarateOrderNumber';

const reviewSchema = new Schema<IReview, ReviewModel>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewId: {
      type: String,
      default: function () {
        return generateOrderNumber('rep-');
      },
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true },
);

export const Review = model<IReview, ReviewModel>('Review', reviewSchema);
