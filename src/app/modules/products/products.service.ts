import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IProduct } from './products.interface';
import Product from './products.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Like } from '../favourit/favourit.model';
import { Cart } from '../cart/cart.model';
import mongoose from 'mongoose';

const getFevoriteProduct = async (productId: string, userId: string) => {
  return await Like.find({ userId, productId });
};

// Helper function to check if a product is in the cart
async function isProductInCart(id: string, productId: string) {
  const cart = await Cart.findOne({
    userId: new mongoose.Types.ObjectId(id),
  }).populate('items');

  if (
    cart &&
    cart.items.some(
      (item) => item.productId.toString() === productId.toString(),
    )
  ) {
    return true;
  }
  return false;
}
const addProduct = async (payload: IProduct, sellerId: string) => {
  // Add seller id to product
  const data = {
    ...payload,
    price: Number(payload.price),
    sellerId,
  };
  // save to DB
  const result = await Product.create(data);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Product creation failed');
  }
  return result;
};
const getProduct = async (query: Record<string, unknown>, userId: string) => {
  const queryBuilder = new QueryBuilder(Product.find({}), query);

  // Fetch all products based on query filters, sorting, pagination, etc.
  const products = await queryBuilder
    .search(['location', 'title', 'category'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .priceFilter()
    .modelQuery.exec();

  // Modify this block to also include cart status
  const productsWithStatus = await Promise.all(
    products.map(async (product: any) => {
      const isLiked = await getFevoriteProduct(product._id.toString(), userId);
      const isInCart = await isProductInCart(userId, product._id);
      return {
        ...product.toObject(),
        isFavorite: isLiked.length > 0,
        isInCart,
      };
    }),
  );

  const meta = await queryBuilder.countTotal();
  return { products: productsWithStatus, meta };
};

const getResentProduct = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  const queryBuilder = new QueryBuilder(Product.find(), query);
  const products = await queryBuilder
    .search(['location', 'title', 'category'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .priceFilter()
    .modelQuery.exec();

  const productsWithFavorites = await Promise.all(
    products.map(async (product: any) => {
      const isLiked = await getFevoriteProduct(product._id.toString(), userId);
      const isInCart = await isProductInCart(userId, product._id);
      return {
        ...product.toObject(),
        isFavorite: isLiked.length > 0,
        isInCart,
      };
    }),
  );
  const meta = await queryBuilder.countTotal();
  return { products: productsWithFavorites, meta };
};
const getFeatureProduct = async (
  query: Record<string, unknown>,
  userId: string,
) => {
  const mergedQuery = {
    totalViews: { $gt: 0 },
  };

  const queryBuilder = new QueryBuilder(Product.find(mergedQuery), query);

  const products = await queryBuilder
    .search(['location', 'title', 'category'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .priceFilter()
    .modelQuery.exec();

  const productsWithFavorites = await Promise.all(
    products.map(async (product: any) => {
      const isLiked = await getFevoriteProduct(product._id.toString(), userId);
      const isInCart = await isProductInCart(userId, product._id);
      return {
        ...product.toObject(),
        isFavorite: isLiked.length > 0,
        isInCart,
      };
    }),
  );

  const meta = await queryBuilder.countTotal();
  return { products: productsWithFavorites, meta };
};
const getSingleProduct = async (id: string) => {
  // Combine find and update into a single operation
  const product = await Product.findByIdAndUpdate(
    id,
    { $inc: { totalViews: 1 } },
    {
      new: true,
      select:
        'title price category description location condition images status totalViews sellerId',
      populate: { path: 'sellerId', select: 'name contactNumber location' },
    },
  );

  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  return product;
};

export const ProductsService = {
  addProduct,
  getProduct,
  getSingleProduct,
  getResentProduct,
  getFeatureProduct,
};
