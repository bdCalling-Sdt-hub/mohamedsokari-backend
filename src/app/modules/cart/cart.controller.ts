import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import CartService from './cart.service';

// Get the user's cart
const getCarts = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const cart = await CartService.getCart(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    data: cart,
    message: 'Cart retrieved successfully',
  });
});

// Add an item to the cart
const addToCart = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const { productId } = req.body;
  const cart = await CartService.addItemToCart(id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    data: cart,
    message: 'Product added to cart successfully',
  });
});

const removeCart = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const { productId } = req.params;
  const cart = await CartService.removeItemFromCart(id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    data: cart,
    message: 'Product removed from cart successfully',
  });
});

export default {
  getCarts,
  addToCart,
  removeCart,
};
