import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const orderConfirmByBuyer = catchAsync(async (req, res) => {
  sendResponse(res, {
    statusCode: StatusCodes.ACCEPTED,
    success: true,
    message: 'Order confirm by buyer successfully',
  });
});
const orderConfirmBySeller = catchAsync(async () => {});
// const orderBySeller = catchAsync(async () => {});

export const OrderController = { orderConfirmByBuyer, orderConfirmBySeller };
