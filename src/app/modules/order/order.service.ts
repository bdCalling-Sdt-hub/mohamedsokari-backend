import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import Product from '../products/products.model';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import mongoose from 'mongoose';

const orderConfirmByBuyer = async (payload: Partial<IOrder>) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const product = await Product.findById(payload.productId)
      .lean()
      .session(session);
    if (!product) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    const order = await Order.create([payload], { session });
    if (!order) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create order',
      );
    }
    await session.commitTransaction();

    sendNotifications({
      receiver: product.sellerId,
      text: `New order placed for product ${product.title}`,
      type: 'ORDER',
      amount: product.price,
    });
    return order[0];
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while confirming the order',
    );
  } finally {
    session.endSession();
  }
};

const orderConfirmBySeller = async () => {};
export const OrderService = { orderConfirmByBuyer, orderConfirmBySeller };
