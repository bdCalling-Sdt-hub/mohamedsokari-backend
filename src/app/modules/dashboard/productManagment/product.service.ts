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
const deleteMultipleProductFromDb = async (productIds: string[]) => {
  const result = await Product.deleteMany({
    _id: { $in: productIds },
  });

  if (result.deletedCount === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Products not found');
  }

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
const getTopDistricts = async (query: Record<string, any>) => {
  const matchFilter: any = {};

  // Check if a month is provided in the query
  if (query?.month) {
    const [year, month] = query?.month.split('-');
    if (!year || !month) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Invalid month format. Use YYYY-MM format.',
      );
    }
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(Number(year), Number(month), 0);

    matchFilter.createdAt = { $gte: startDate, $lt: endDate };
  }
  // If no month is provided, filter by year if provided
  else if (query?.year) {
    const year = query?.year;
    if (!year) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Year is required in YYYY format.',
      );
    }
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(Number(year) + 1, 0, 0);

    matchFilter.createdAt = { $gte: startDate, $lt: endDate };
  }
  // If no specific month or year is provided, filter by this year
  else {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(currentYear + 1, 0, 0);

    matchFilter.createdAt = { $gte: startDate, $lt: endDate };
  }

  // Pagination: page and limit with defaults
  const page = parseInt(query?.page || '1'); // Default to 1
  const limit = parseInt(query?.limit || '5'); // Default to 5

  // Ensure valid pagination values
  if (page <= 0 || limit <= 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Page and limit should be positive integers.',
    );
  }

  const skip = (page - 1) * limit;

  // Aggregation pipeline
  const topDistricts = await Product.aggregate([
    {
      $match: matchFilter,
    },
    {
      $group: {
        _id: {
          location: '$location',
          category: '$category',  // Group by both location and category
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 }, // Sort by count descending
    },
    {
      $project: {
        _id: 0,
        district: '$_id.location',  // Extract location as 'district'
        category: '$_id.category',  // Extract category
        count: 1,
      },
    },
    {
      $skip: skip, // Skip for pagination
    },
    {
      $limit: limit, // Limit the number of records returned
    },
  ]);

  if (!topDistricts || topDistricts.length === 0) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'No user data found for the given filters',
    );
  }

  // Return results with pagination metadata
  const total = await Product.countDocuments(matchFilter);

  const totalPage = Math.ceil(total / limit); // Calculate total pages

  return {
    data: topDistricts,
    pagination: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};
const getTopCategory = async (query: Record<string, any>) => {
  const matchFilter: any = {};

  // Check if a month is provided in the query
  if (query?.month) {
    const [year, month] = query?.month.split('-');
    if (!year || !month) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Invalid month format. Use YYYY-MM format.',
      );
    }
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(Number(year), Number(month), 0);

    matchFilter.createdAt = { $gte: startDate, $lt: endDate };
  }
  // If no month is provided, filter by year if provided
  else if (query?.year) {
    const year = query?.year;
    if (!year) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Year is required in YYYY format.',
      );
    }
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(Number(year) + 1, 0, 0);

    matchFilter.createdAt = { $gte: startDate, $lt: endDate };
  }
  // If no specific month or year is provided, filter by this year
  else {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(currentYear + 1, 0, 0);

    matchFilter.createdAt = { $gte: startDate, $lt: endDate };
  }

  // Check if location is provided in the query
  if (query?.location) {
    matchFilter.location = query.location;
  }

  // Pagination: page and limit with defaults
  const page = parseInt(query?.page || '1'); 
  const limit = parseInt(query?.limit || '5'); 

  // Ensure valid pagination values
  if (page <= 0 || limit <= 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Page and limit should be positive integers.',
    );
  }

  const skip = (page - 1) * limit;

  // Aggregation pipeline to get top categories per district
  const topCategoriesPerDistrict = await Product.aggregate([
    {
      $match: matchFilter, 
    },
    {
      $group: {
        _id: {
          location: '$location',  
          category: '$category', 
        },
        count: { $sum: 1 }, 
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $project: {
        _id: 0,
        district: '$_id.location',
        category: '$_id.category',
        count: 1,
      },
    },
    {
      $skip: skip, 
    },
    {
      $limit: limit, 
    },
  ]);

  if (!topCategoriesPerDistrict || topCategoriesPerDistrict.length === 0) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'No categories data found for the given filters',
    );
  }

  // Return results with pagination metadata
  const total = await Product.countDocuments(matchFilter);

  const totalPage = Math.ceil(total / limit); // Calculate total pages

  return {
    data: topCategoriesPerDistrict,
    pagination: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};


export const DashboardProductService = {
  getAllProductsFromDb,
  getSingleProductFromDb,
  deleteProductFromDb,
  getProductAnalytics,
  deleteMultipleProductFromDb,
  getTopDistricts,
  getTopCategory
};
