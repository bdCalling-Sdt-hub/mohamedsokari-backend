import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Like } from './favourit.model';
import Product from '../products/products.model';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';

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

const deleteFavouriteProduct = async (userId: string, productId: string) => {
  const likedProduct = await Like.findOne({ userId, productId });
  if (!likedProduct) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found in favourite');
  }

  const deleteProduct = await Like.findByIdAndDelete(likedProduct._id);
  if (!deleteProduct) {
    throw new AppError(StatusCodes.NOT_FOUND, "Favourite  item can't deleted!");
  }
  return deleteProduct;
};

const getAllFavouritList = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(Like.find({ userId }), query);
  const favouritList = await queryBuilder.fields().paginate().modelQuery.exec();

  const meta = await queryBuilder.countTotal();
  return { favouritList, meta };
};
export const FavouritProductsSevices = {
  likedProducts,
  getAllFavouritList,
  deleteFavouriteProduct,
};
