import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { DashboardProductService } from './product.service';

const getAllProducts = catchAsync(async (req, res) => {
  const result = await DashboardProductService.getAllProductsFromDb(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Products retrieved successfully.',
    data: result.products,
    pagination: result.meta,
  });
});
const getSingleProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DashboardProductService.getSingleProductFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully.',
    data: result,
  });
});
const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DashboardProductService.deleteProductFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product deleted successfully.',
    data: result,
  });
});
const deleteMultipleProducts = catchAsync(async (req, res) => {
  const { productIds } = req.body;
  const result =
    await DashboardProductService.deleteMultipleProductFromDb(productIds);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Products deleted successfully.',
    data: result,
  });
});
const getProductStatistics = catchAsync(async (req, res) => {
  const result = await DashboardProductService.getProductAnalytics(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product statistics retrieved successfully',
    data: result,
  });
});
const getTopDistricts = catchAsync(async (req, res) => {
  const result = await DashboardProductService.getTopDistricts(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Top districts retrieved successfully',
    data: result.data,
    pagination: result.pagination
  });
});
const getTopCategory = catchAsync(async (req, res) => {
  const result = await DashboardProductService.getTopCategory(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Top category retrieved successfully',
    data: result.data,
    pagination: result.pagination
  });
});
export const DashboardProductController = {
  getAllProducts,
  getSingleProduct,
  deleteProduct,
  deleteMultipleProducts,
  getProductStatistics,
  getTopDistricts,
  getTopCategory
};
