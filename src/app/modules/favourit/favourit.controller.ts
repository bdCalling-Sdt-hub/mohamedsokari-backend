import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FavouritProductsSevices } from './favourit.service';

const likedProductsOrUnliked = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const { productId } = req.params;
  const result = await FavouritProductsSevices.likedProducts(id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product liked successfully',
    data: result,
  });
});

const getFavouritProducts = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const result = await FavouritProductsSevices.getAllFavouritList(
    id,
    req.query,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Favourit products retrieved successfully',
    data: result,
  });
});

const removeLikedProduct = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const { productId } = req.params;
  const result = await FavouritProductsSevices.deleteFavouriteProduct(
    id,
    productId,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product removed successfully',
    data: result,
  });
});
export const FavouritProductsController = {
  likedProductsOrUnliked,
  removeLikedProduct,
  getFavouritProducts,
};
