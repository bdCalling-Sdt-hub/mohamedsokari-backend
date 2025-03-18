import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import Product from '../products/products.model';
import { CartItem } from './cart.interface';
import { Cart } from './cart.model';

const addItemToCart = async (userId: string, productId: any) => {
  const product: any = await Product.findById(productId);
  if (!product) throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');

  let cart: any = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items: [{ productId }],
      totalPrice: product.price,
    });
  } else {
    const existingItem = cart.items.find(
      (item: CartItem) => item.productId.toString() === productId,
    );

    if (!existingItem) {
      cart.items.push({ productId });
      cart.totalPrice += product.price;
    }
  }

  await cart.save();
  return cart;
};

const removeItemFromCart = async (userId: string, productId: string) => {
  const cart: any = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart) throw new AppError(StatusCodes.NOT_FOUND, 'Cart not found');
  console.log('cart', cart);
  const itemIndex = cart.items.findIndex(
    (item: any) => item.productId._id.toString() === productId,
  );

  if (itemIndex === -1) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Item not found in cart');
  }
  cart.items.splice(itemIndex, 1);

  let newTotalPrice: number = cart.items.reduce(
    (acc: any, item: any) => acc + item.productId.price,
    0,
  );

  if (isNaN(newTotalPrice)) {
    newTotalPrice = 0;
  }

  cart.totalPrice = newTotalPrice;

  if (cart.items.length === 0) {
    cart.totalPrice = 0;
  }

  await cart.save();
  return cart;
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
