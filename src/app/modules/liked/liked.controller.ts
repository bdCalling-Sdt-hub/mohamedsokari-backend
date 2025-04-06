import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { LikedProductsSevices } from './liked.service';

const likedProductsOrUnliked = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const { productId } = req.params;
  const result = await LikedProductsSevices.likedProducts(id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});
const getLikedProduct = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const { productId } = req.params;
  const result = await LikedProductsSevices.likedProducts(id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    data: result,
  });
});
export const LikedProductsController = {
  likedProductsOrUnliked,
  getLikedProduct,
};
