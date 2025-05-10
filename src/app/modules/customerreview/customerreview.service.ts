import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import mongoose from 'mongoose';
import { User } from '../user/user.model';
import Product from '../products/products.model';
import QueryBuilder from '../../builder/QueryBuilder';

// Helper function to find product
const findUserById = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user;
};

// Create a review
const createReviewToDB = async (
  payload: any,
  userId: any,
  productId: string,
) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  const seller = await User.findById(product?.sellerId);
  if (!seller) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Seller not found');
  }

  // Check if the user has already reviewed the product
  const existingReview = seller?.reviews.find(
    (review) => review.userId.toString() === userId.toString(),
  );

  if (existingReview) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You have already reviewed this product',
    );
  }

  const newReview = {
    userId,
    ...payload,
    productId,
    date: new Date(),
  };
  await User.findByIdAndUpdate(
    seller._id,
    {
      $push: { reviews: newReview },
    },
    { new: true },
  );
  return newReview;
};

const updateReviewInDB = async (
  payload: any,
  userId: any,
  productId: string,
) => {
  const { rating, comment, images } = payload;

  // Find the product by its ID
  const product: any = await Product.findById(productId);
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  // Find the seller based on the sellerId from the product
  const seller = await findUserById(product.sellerId);
  if (!seller) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Seller not found');
  }

  // Use findOneAndUpdate to directly target the review by userId
  const updatedSeller = await User.findOneAndUpdate(
    {
      _id: seller._id,
      'reviews.userId': userId,
      'reviews.productId': productId,
    },
    {
      $set: {
        'reviews.$.rating': rating, // Update the rating
        'reviews.$.comment': comment, // Update the comment
        'reviews.$.images': images, // Update the images
        'reviews.$.date': new Date(), // Update the date
      },
    },
    { new: true }, // Return the updated document
  );

  // Ensure the updated seller is returned with updated reviews
  if (!updatedSeller) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found after update');
  }

  // Find the updated review from the seller's reviews array
  const updatedReview = updatedSeller.reviews.find(
    (review) => review.userId.toString() === userId.toString(),
  );

  if (!updatedReview) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  return updatedReview;
};

const deleteReviewFromDB = async (userId: string, productId: string) => {
  const product: any = await Product.findById(productId);

  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  const seller = await findUserById(product.sellerId);
  if (!seller) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Seller not found');
  }

  // Find the review to delete using the $pull operator
  const updatedSeller = await User.findOneAndUpdate(
    {
      _id: seller._id,
      'reviews.userId': userId,
      'reviews.productId': productId,
    },
    { $pull: { reviews: { userId: userId } } },
    { new: true },
  );

  if (!updatedSeller) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  return { message: 'Review deleted successfully' };
};

const getUserReviewStats = async (id: string) => {
  // Aggregation to get reviews by rating
  const product = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $unwind: '$reviews',
    },
    {
      $group: {
        _id: '$reviews.rating',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  if (!product || product.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No reviews found for the user');
  }

  // Calculate the total count of reviews
  const totalReviews = product.reduce(
    (sum: number, item: any) => sum + item.count,
    0,
  );

  // Calculate the average rating
  const averageRating =
    product.reduce((sum: number, item: any) => sum + item._id * item.count, 0) /
    totalReviews;

  // Prepare the result with ratings distribution
  const ratingsDistribution: { [key in '1' | '2' | '3' | '4' | '5']: number } =
    {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

  // Distribute the counts of each rating to corresponding keys
  product.forEach((item: any) => {
    const ratingKey = item._id.toString() as '1' | '2' | '3' | '4' | '5';
    ratingsDistribution[ratingKey] = item.count;
  });

  return {
    averageRating,
    totalReviews,
    ratingsDistribution,
  };
};
const getUserComments = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  return result.reviews;
};
const getUserReview = async (id: string) => {
  // Aggregation to get reviews by rating
  const product = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $unwind: '$reviews',
    },
    {
      $group: {
        _id: '$reviews.rating',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  if (!product || product.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No reviews found for the user');
  }

  // Calculate the total count of reviews
  const totalReviews = product.reduce(
    (sum: number, item: any) => sum + item.count,
    0,
  );

  // Calculate the average rating
  const averageRating =
    product.reduce((sum: number, item: any) => sum + item._id * item.count, 0) /
    totalReviews;

  return {
    averageRating,
    totalReviews,
  };
};

export const CustomerReviewService = {
  createReviewToDB,
  updateReviewInDB,
  deleteReviewFromDB,
  getUserReviewStats,
  getUserComments,
  getUserReview
};
