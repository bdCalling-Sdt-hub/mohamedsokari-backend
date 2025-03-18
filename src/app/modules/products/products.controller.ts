import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProductsService } from './products.service';

const addProduct = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await ProductsService.addProduct(req.body, id);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Product added successfully.',
    data: result,
  });
});
const getAllProducts = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ProductsService.getProduct(query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully.',
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
// const addProduct = catchAsync(async (req, res) => {});
// const addProduct = catchAsync(async (req, res) => {});

export const Productcontroller = { addProduct, getAllProducts, getProduct };
