import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { User } from '../../user/user.model';
import { Order } from '../../order/order.model';
// get all users
const allUser = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(User.find({ role: 'USER' }), query);

  const users = await queryBuilder
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  return { users, meta };
};
// get single users
const singleUser = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }
  return result;
};
// update  users
const updateUserStatus = async (id: string, status: string) => {
  const result = await User.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true },
  );
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }
  return result;
};
const getSellerHistory = async (
  sellerId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(
    Order.find({ sellerId })
      .populate('productId', 'title')
      .populate('customerId', 'location name'),
    query,
  );
  const history = await queryBuilder
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  return { history, meta };
};
const getBuyerHistory = async (
  customerId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(
    Order.find({ customerId })
      .populate('productId', 'title')
      .populate('sellerId', 'location name'),
    query,
  );
  const history = await queryBuilder
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  return { history, meta };
};
// get user analysis history
const getUserAnalytics = async (query: Record<string, any>) => {
  const matchFilter: any = {};

  if (query?.location) {
    matchFilter.location = query.location;
  }

  if (query?.year) {
    const startDate = new Date(`${query.year}-01-01`);
    const endDate = new Date(`${query.year}-12-31`);

    matchFilter.createdAt = { $gte: startDate, $lt: endDate };
  }

  const userAnalytics = await User.aggregate([
    {
      $match: matchFilter,
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
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
        count: 1,
      },
    },
  ]);

  if (!userAnalytics || userAnalytics.length === 0) {
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

    const monthsCount = new Array(12).fill(0);

    for (let month = 0; month < 12; month++) {
      result.push({
        month: monthNames[month],
        count: monthsCount[month],
      });
    }

    return result;
  }

  const monthsCount = new Array(12).fill(0);

  userAnalytics.forEach((data: any) => {
    const { month, count } = data;
    monthsCount[month - 1] = count;
  });

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

  for (let month = 0; month < 12; month++) {
    result.push({
      month: monthNames[month],
      count: monthsCount[month],
    });
  }

  return result;
};
// get location wise users
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

  const topDistricts = await User.aggregate([
    {
      $match: matchFilter,
    },
    {
      $group: {
        _id: '$location',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $project: {
        _id: 0,
        district: '$_id',
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
  const totalUsers = await User.countDocuments(matchFilter); // Get total number of users matching the filter

  const totalPages = Math.ceil(totalUsers / limit); // Calculate total pages

  return {
    success: true,
    message: 'Top districts retrieved successfully',
    data: topDistricts,
    pagination: {
      page,
      limit,
      totalUsers,
      totalPages,
    },
  };
};

export const DashboardUserService = {
  allUser,
  singleUser,
  updateUserStatus,
  getSellerHistory,
  getBuyerHistory,
  getUserAnalytics,
  getTopDistricts,
};
