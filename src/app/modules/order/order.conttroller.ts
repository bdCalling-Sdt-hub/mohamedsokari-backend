import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OrderService } from './order.service';

const orderConfirmByBuyer = catchAsync(async (req, res) => {
    const result = await OrderService.orderConfirmByBuyer(req.body)
  sendResponse(res, {
    statusCode: StatusCodes.ACCEPTED,
    success: true,
    message: 'Order confirm by buyer successfully',
    data: result,
  });
});
const orderConfirmBySeller = catchAsync(async () => {});
// const orderBySeller = catchAsync(async () => {});

export const OrderController = { orderConfirmByBuyer, orderConfirmBySeller };
