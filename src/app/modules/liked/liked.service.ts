import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Like } from './liked.model';
import Product from '../products/products.model';
import mongoose from 'mongoose';

const likedProducts = async (userId: string, productId: string) => {
  // Start a session for a transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingLike = await Like.findOne({ userId, productId }).session(
      session,
    );

    if (existingLike) {
      await Like.deleteOne({ userId, productId }).session(session);
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { liked: -1 } },
        { session },
      );

      await session.commitTransaction();
      return { isLiked: false };
    } else {
      const newLike = new Like({ userId, productId });
      await newLike.save({ session });

      await Product.findByIdAndUpdate(
        productId,
        { $inc: { liked: 1 } },
        { session },
      );

      await session.commitTransaction();
      return { isLiked: true };
    }
  } catch (error) {
    await session.abortTransaction();
    console.error('Error during like/unlike process:', error);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while processing your like/unlike action',
    );
  } finally {
    session.endSession();
  }
};
const getLikedProduct = async (userId: string, productId: string) => {
  const like = await Like.findOne({ userId, productId });
  if (like) {
    return true;
  } else {
    return false;
  }
};
export const LikedProductsSevices = {
  likedProducts,
  getLikedProduct
};
