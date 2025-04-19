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
      console.log('Cart does not exist. Creating a new cart.');
      cart = new Cart({
        userId,
        items: [{ productId }],
        totalPrice: 0,
      });
    } else {
      // If the cart exists, check if the product is already in the cart
      const existingItem = cart.items.find(
        (item: any) => item.productId.toString() === productId,
      );

      if (existingItem) {
        return cart;
      } else {
        cart.items.push({ productId });
      }
    }

    console.log('Updating product with ID:', productId);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { countAddToCart: 1 } },
      { new: true, session },
    );

    if (!updatedProduct) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    // Update the total price of the cart
    cart.totalPrice = cart.items.reduce((total: any, item: any) => {
      const productPrice = updatedProduct.price;
      return total + productPrice;
    }, 0);

    // Save the cart in the session
    await cart.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    return cart;
  } catch (error) {
    console.error('Error during cart operation:', error);
    if (error instanceof AppError) {
      console.error('AppError details:', error);
    } else {
      console.error('Unexpected error details:', error);
    }
    // Abort the transaction in case of an error
    await session.abortTransaction();
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
