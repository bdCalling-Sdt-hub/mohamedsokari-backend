import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import Product from '../products/products.model';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import mongoose from 'mongoose';
import { User } from '../user/user.model';

// Order confirm by buyer
const orderConfirmByBuyer = async (payload: Partial<IOrder>) => {
  const user = await User.findById(payload.customerId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Check if an order already exists for the given customerId
  const isExistOrderByUser = await Order.findOne({
    customerId: payload.customerId,
  });

  if (isExistOrderByUser) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Order already requested by user',
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Fetch the product and ensure it's
    const product = await Product.findById(payload.productId).session(session);
    if (!product) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    // Create the order with the session
    const order = await Order.create([payload], { session });
    if (!order) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to create order',
      );
    }

    await session.commitTransaction();

    // Send notifications to the seller
    await sendNotifications({
      receiver: payload.sellerId,
      text: `New order has been placed by ${user.name} for the product: ${product.title}.`,
      type: 'ORDER',
      orderId: order[0]._id,
      amount: product.price,
    });

    return order[0];
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error during order confirmation: ', error.message);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while confirming the order',
    );
  } finally {
    session.endSession();
  }
};

// get order
const getOrder = async (orderId: string) => {
  const order = await Order.findById(orderId)
    .populate({
      path: 'customerId',
      select: 'name email contactNumber location',
    })
    .populate({
      path: 'productId',
      select: 'title category price images ',
    });
  if (!order) {
    return [];
  }
  return order;
};
// order confirm by seller
const orderConfirmBySeller = async (id: string, productId: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Update the order status to 'completed'
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status: 'completed' } },
      { session, new: true },
    );
    if (!order) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Order not found or already completed',
      );
    }
    // Update the product status to 'sold'
    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: { status: 'sold' } },
      { session, new: true },
    );
    if (!product) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update product');
    }

    // Sending notifications to the customer
    await sendNotifications({
      receiver: order.customerId,
      text: `Your order for the product '${product.title}' has been successfully placed.`,
      type: 'DELIVERY',
      amount: product.price,
    });

    // Sending notifications to the seller
    await sendNotifications({
      receiver: order.sellerId,
      text: `The product '${product.title}' has been successfully sold.`,
      type: 'DELIVERY',
      amount: product.price,
    });

    // Commit the transaction if everything goes well
    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    session.endSession();
  }
};
const cancelledOrderBySeller = async (orderId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
    }
    // Ensure that the order has not already been cancelled or completed
    if (order.status === 'completed') {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Order cannot be cancelled in its current state',
      );
    }
    const result = await Order.findByIdAndDelete(orderId).session(session);
    if (!result) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to cancel order',
      );
    }
    // Sending notifications to the customer
    await sendNotifications({
      receiver: order.customerId,
      text: `Your order has been cancelled by seller.`,
      type: 'CANCELLED',
    });

    await session.commitTransaction();
    return result;
  } catch (error: any) {
    await session.abortTransaction();
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    session.endSession();
  }
};
export const OrderService = {
  orderConfirmByBuyer,
  orderConfirmBySeller,
  getOrder,
  cancelledOrderBySeller,
};
