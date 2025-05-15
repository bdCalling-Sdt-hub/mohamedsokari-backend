import { Model, Types } from 'mongoose';

export type IReview = {
  customer: Types.ObjectId;
  reviewId: string;
  comment: string;
  rating: number;
};

export type ReviewModel = Model<IReview>;
