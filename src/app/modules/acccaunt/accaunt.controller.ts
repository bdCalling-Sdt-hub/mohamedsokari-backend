import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AccauntService } from './accaunt.service';

const getMyListing = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const result = await AccauntService.getMyListingProduct(id, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'My listing retrieved successfully',
    data: result.listing,
    pagination: result.meta,
  });
});
const editMyListingProduct = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const { productId } = req.params;
  const { ...product } = req.body;
  const result = await AccauntService.editProduct(id, productId, product);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});
// delete my listing product
const deleteMyListingProduct = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const { productId } = req.params;
  const result = await AccauntService.deleteProduct(id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product deleted successfully',
    data: result,
  });
});

export const AccauntController = {
  getMyListing,
  deleteMyListingProduct,
  editMyListingProduct,
};
