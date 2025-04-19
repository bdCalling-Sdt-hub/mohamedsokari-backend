
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { CustomerReviewService } from './customerreview.service';

// Create a review
const createReview = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const productId = req.params.id;
  const result = await CustomerReviewService.createReviewToDB(req.body, id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review Created Successfully',
    data: result,
  });
});

// Update a review
const updateReview = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const productId = req.params.id;
  const result = await CustomerReviewService.updateReviewInDB(req.body, id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review Updated Successfully',
    data: result,
  });
});

// Delete a review
const deleteReview = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const productId = req.params.id;
  const result = await CustomerReviewService.deleteReviewFromDB(id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
  });
});
// Delete a review
const analysisReview = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const result = await CustomerReviewService.getUserReviewStats(userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review analysis retrieved successfully',
    data: result,
  });
});

export const CustomerReviewController = {
  createReview,
  updateReview,
  deleteReview,
  analysisReview,
};
