import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import Product from '../../products/products.model';

const getAllProductsFromDb = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Product.find({}), query);

  const products = await queryBuilder
    .search(['title', 'location', 'category'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  return { products, meta };
};
const getSingleProductFromDb = async (id: string) => {
  const result = await Product.findById(id);
  if (!result) throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  return result;
};
const deleteProductFromDb = async (id: string) => {
  const result = await Product.findByIdAndDelete(id);
  if (!result) throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  return result;
};
const deleteMultipleProductFromDb = async (userIds: string[]) => {
  const result = await Product.deleteMany({ _id: { $in: userIds } });
  if (!result) throw new AppError(StatusCodes.NOT_FOUND, 'Products not found');
  return result;
};
const getProductAnalytics = async (query: Record<string, any>) => {
  const matchFilter: any = {};

  if (query?.location) {
    matchFilter.district = query.district;
  }

  if (query?.year) {
    const startDate = new Date(`${query.year}-01-01`);
    const endDate = new Date(`${query.year}-12-31`);
    matchFilter.createdAt = { $gte: startDate, $lt: endDate };
  }

  const productAnalytics = await Product.aggregate([
    {
      $match: matchFilter,
    },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        availableCount: { $sum: '$quantity' },
        soldCount: { $sum: '$sold' },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        year: '$_id.year',
        availableCount: 1,
        soldCount: 1,
      },
    },
  ]);

  // If no product analytics are found, return 0 for all months
  if (!productAnalytics || productAnalytics.length === 0) {
    const result = [];
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Initialize all months with 0 count for both available and sold products
    const monthsCount = new Array(12).fill({ availableCount: 0, soldCount: 0 });

    for (let month = 0; month < 12; month++) {
      result.push({
        month: monthNames[month],
        availableCount: monthsCount[month].availableCount,
        soldCount: monthsCount[month].soldCount,
      });
    }

    return result;
  }

  // Fill in the product analytics for each month
  const result = [];
  const monthsCount = new Array(12).fill({ availableCount: 0, soldCount: 0 });

  // Populate the months with the actual data
  productAnalytics.forEach((data: any) => {
    const { month, availableCount, soldCount } = data;
    monthsCount[month - 1] = { availableCount, soldCount }; // Subtract 1 to match month index (0-based)
  });

  // Construct the result with month names and the corresponding data
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  for (let month = 0; month < 12; month++) {
    result.push({
      month: monthNames[month],
      availableCount: monthsCount[month].availableCount,
      soldCount: monthsCount[month].soldCount,
    });
  }

  return result;
};

export const DashboardProductService = {
  getAllProductsFromDb,
  getSingleProductFromDb,
  deleteProductFromDb,
  getProductAnalytics,
  deleteMultipleProductFromDb,
};
