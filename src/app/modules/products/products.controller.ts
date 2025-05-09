import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProductsService } from './products.service';

const addProduct = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const result = await ProductsService.addProduct(req.body, id);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Product added successfully.',
    data: result,
  });
});
// get all products
const getAllProducts = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const query = req.query;
  const result = await ProductsService.getProduct(query, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully.',
    data: result,
  });
});
const getResentProducts = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const query = req.query;
  const result = await ProductsService.getResentProduct(query, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Resent Product retrieved successfully.',
    data: result,
  });
});
const getProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ProductsService.getSingleProduct(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully.',
    data: result,
  });
});
const getFeatureProduct = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const result = await ProductsService.getFeatureProduct(req.query, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully.',
    data: result,
  });
});

export const Productcontroller = {
  addProduct,
  getAllProducts,
  getProduct,
  getResentProducts,
  getFeatureProduct,
};
