import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import Product from '../products/products.model';
import { Cart } from './cart.model';
import mongoose from 'mongoose';

const addItemToCart = async (userId: string, productId: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let cart: any = await Cart.findOne({ userId }).session(session);

    if (!cart) {
      // If cart doesn't exist, create a new one
      cart = new Cart({
        userId,
        items: [{ productId }],
        totalPrice: 0,
      });
    }

    const existingItem = cart.items.find(
      (item: any) => item.productId.toString() === productId,
    );

    if (existingItem) {
      throw new AppError(
        StatusCodes.CONFLICT,
        'Product already in the cart, not adding again.',
      );
    } else {
      cart.items.push({ productId });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { countAddToCart: 1 } },
      { new: true, session },
    );

    if (!updatedProduct) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    cart.totalPrice = cart.items.reduce((total: any, item: any) => {
      const productPrice = updatedProduct.price;
      return total + productPrice;
    }, 0);

    await cart.save({ session });

    await session.commitTransaction();

    return cart;
  } catch (error) {
    await session.abortTransaction();
    console.error('Error during cart operation:', error);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error adding to cart',
    );
  } finally {
    session.endSession();
  }
};

const removeItemFromCart = async (userId: string, productId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ userId })
      .populate('items.productId')
      .session(session);
    if (!cart) throw new AppError(StatusCodes.NOT_FOUND, 'Cart not found');

    // Find the index of the product in the cart
    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId._id.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Item not found in cart');
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    // Recalculate the total price of the cart
    let newTotalPrice: number = cart.items.reduce(
      (acc: any, item: any) => acc + item.productId.price,
      0,
    );

    if (isNaN(newTotalPrice)) {
      newTotalPrice = 0;
    }

    cart.totalPrice = newTotalPrice;

    // If the cart is empty, set totalPrice to 0
    if (cart.items.length === 0) {
      cart.totalPrice = 0;
    }

    // Decrement the countAddToCart field for the product
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { countAddToCart: -1 } },
      { session },
    );
    await cart.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    return cart;
  } catch (error) {
    await session.abortTransaction();
    console.error('Error during cart operation:', error);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error removing from cart',
    );
  } finally {
    session.endSession();
  }
};

const getCart = async (userId: string) => {
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart) throw new AppError(StatusCodes.NOT_FOUND, 'Cart not found');
  return cart;
};

const CartService = {
  addItemToCart,
  removeItemFromCart,
  getCart,
};

export default CartService;
