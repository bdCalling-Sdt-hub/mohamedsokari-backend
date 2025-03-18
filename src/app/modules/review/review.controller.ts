import catchAsync from '../../../shared/catchAsync';
import { ReviewService } from './review.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createReview = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const reviewPayload = { ...req.body, customer: id };
  const result = await ReviewService.createReviewToDB(reviewPayload);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review Created Successfully',
    data: result,
  });
});
const removeReview = catchAsync(async (req, res) => {
  const result = await ReviewService.deleteReviewToDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review deleted Successfully',
    data: result,
  });
});
const getAllReview = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ReviewService.getReviews(query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review retrieved Successfully',
    data: result.review,
    pagination: result.meta,
  });
});
const getAnalysis = catchAsync(async (req, res) => {
  const result = await ReviewService.getReviewAnalysis();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review analysis retrieved Successfully',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  removeReview,
  getAnalysis,
  getAllReview,
};
