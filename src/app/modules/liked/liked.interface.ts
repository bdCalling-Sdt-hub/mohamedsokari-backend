import { Types } from 'mongoose';
export interface ILiked {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  liked: boolean;
}
