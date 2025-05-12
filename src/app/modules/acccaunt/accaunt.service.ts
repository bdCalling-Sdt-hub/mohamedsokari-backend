import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IProduct } from '../products/products.interface';
import Product from '../products/products.model';
import { Cart } from '../cart/cart.model';
import { Like } from '../favourit/favourit.model';
import mongoose from 'mongoose';

const getMyListingProduct = async (
  sellerId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(Product.find({ sellerId }), query);
  const listing = await queryBuilder
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();
  return { listing, meta };
};
// edit products
const editProduct = async (
  id: string,
  productId: string,
  products: Partial<IProduct>,
) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  if (product.sellerId.toString() !== id) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'You are not authorized to edit this product',
    );
  }
  const data = {
    ...products,
    price: Number(products.price),
  };
  const updatedProduct = await Product.findByIdAndUpdate(productId, data, {
    new: true,
  });
  if (!updatedProduct) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Failed to update product');
  }
  return updatedProduct;
};
// delete products
const deleteProduct = async (id: string, productId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
    }

    if (product.sellerId.toString() !== id) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized to delete this product',
      );
    }

    // Remove product from all user carts
    await Cart.updateMany(
      { 'items.productId': productId },
      { $pull: { items: { productId } } },
      { session },
    );

    // Remove product from all user likes
    await Like.deleteMany({ productId }, { session });

    // Delete the product itself
    const deletedProduct =
      await Product.findByIdAndDelete(productId).session(session);
    if (!deletedProduct) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Failed to delete product');
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return deletedProduct;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
export const AccauntService = {
  getMyListingProduct,
  editProduct,
  deleteProduct,
};
