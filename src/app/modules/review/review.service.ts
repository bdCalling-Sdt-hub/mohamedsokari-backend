import mongoose, { ObjectId } from 'mongoose';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';

const createReviewToDB = async (payload: IReview): Promise<IReview> => {
  const result = await Review.create(payload);

  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Review');
  }

  return result; // Return the created review
};
const deleteReviewToDB = async (id: string) => {
  const result = await Review.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed To delete Review');
  }
  return result;
};

const getReviewAnalysis = async () => {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  if (!stats) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'No reviews found for this tutorial',
    );
  }
  // Calculate average rating
  const totalReviews = stats.reduce((sum, stat) => sum + stat.count, 0);
  const averageRating =
    stats.reduce((sum, stat) => sum + stat._id * stat.count, 0) / totalReviews;

  return {
    averageRating: averageRating.toFixed(1),
    reviewCount: totalReviews,
    ratingDistribution: stats.map((stat) => ({
      rating: stat._id,
      count: stat.count,
    })),
  };
};
const getReviews = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Review.find({}), query);
  const review = await queryBuilder
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();
  return {
    review,
    meta,
  };
};
export const ReviewService = {
  createReviewToDB,
  deleteReviewToDB,
  getReviewAnalysis,
  getReviews,
};