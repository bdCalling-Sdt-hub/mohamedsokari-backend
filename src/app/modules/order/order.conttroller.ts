import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OrderService } from './order.service';

const orderConfirmByBuyer = catchAsync(async (req, res) => {
  const result = await OrderService.orderConfirmByBuyer(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.ACCEPTED,
    success: true,
    message: 'Order confirm by buyer successfully',
    data: result,
  });
});
const getOrderbyId = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderService.getOrder(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});
const orderConfirmBySeller = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { productId } = req.body;
  const result = await OrderService.orderConfirmBySeller(id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.ACCEPTED,
    success: true,
    message: 'Order confirm by seller successfully',
    data: result,
  });
});
const cancelledOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  await OrderService.cancelledOrderBySeller(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order has been cancelled!',
  });
});
const transactionOrders = catchAsync(async (req, res) => {
  const result = await OrderService.getTransaction(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Transaction retrieved successfully',
    data: result.transaction,
    pagination: result.meta,
  });
});
const transactionSingleDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrderService.getTransactionSingle(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Transaction retrieved successfully',
    data: result,
  });
});

export const OrderController = {
  orderConfirmByBuyer,
  orderConfirmBySeller,
  getOrderbyId,
  cancelledOrder,
  transactionOrders,
  transactionSingleDetails,
};
