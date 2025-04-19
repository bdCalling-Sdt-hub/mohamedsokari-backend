import { Model, Types } from 'mongoose';

export type ICustomerReview = {
  customer: Types.ObjectId;
  comment: string;
  rating: number;
  images: string[];
};

export type CustomerReviewModel = Model<ICustomerReview>;
