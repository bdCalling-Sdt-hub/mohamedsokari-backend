import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IProduct } from '../products/products.interface';
import Product from '../products/products.model';

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
  const updatedProduct = await Product.findByIdAndUpdate(productId, products, {
    new: true,
  });
  if (!updatedProduct) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Failed to update product');
  }
  return updatedProduct;
};
// delete products
const deleteProduct = async (id: string, productId: string) => {
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
  const deletedProduct = await Product.findByIdAndDelete(productId);
  if (!deletedProduct) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Failed to delete product');
  }
  return deletedProduct;
};

export const AccauntService = {
  getMyListingProduct,
  editProduct,
  deleteProduct,
};
