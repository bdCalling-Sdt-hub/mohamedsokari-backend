import { string } from 'zod';
import { Order } from '../order/order.model';
import Product from '../products/products.model';
import { User } from '../user/user.model';

// date helper
const getStartDate = (filter: string) => {
  const currentDate = new Date();
  let startDate;

  switch (filter) {
    case 'thisMonth':
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      break;
    case 'thisYear':
      startDate = new Date(currentDate.getFullYear(), 0, 1);
      break;
    case 'allTime':
      startDate = new Date(2000, 0, 1);
      break;
    default:
      startDate = new Date(2000, 0, 1);
      break;
  }
  return startDate;
};

// total user
const totalUsers = async (filter: string) => {
  const startDate = getStartDate(filter);
  const users = await User.countDocuments({ createdAt: { $gte: startDate } });
  return users;
};
// total active listing
const totalActiveListing = async (filter: string) => {
  const startDate = getStartDate(filter);
  const products = await Product.countDocuments({
    status: 'available',
    createdAt: { $gte: startDate },
  });
  return products;
};
// total sold listing
const totalSoldListing = async (filter: string) => {
  const startDate = getStartDate(filter);
  const products = await Product.countDocuments({
    status: 'sold',
    createdAt: { $gte: startDate },
  });
  return products;
};
// total revenue
const totalRevenue = async (filter: string) => {
  const startDate = getStartDate(filter);
  const orders = await Order.find({ createdAt: { $gte: startDate } });

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  return totalRevenue;
};
const totalRevenueAnalisys = async (year: number) => {
  try {
    const startDate = new Date(`${year}-01-01T00:00:00Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);

    const revenueChart = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed'] }, // Adjusted to check the value inside the object
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $project: {
          month: { $month: '$createdAt' },
          totalPrice: 1,
        },
      },
      {
        $group: {
          _id: '$month',
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthsOfYear = [
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

    const formattedRevenueChart = monthsOfYear.map((month, index) => {
      const monthData = revenueChart.find(item => item._id === index + 1);
      return {
        month,
        totalRevenue: monthData ? monthData.totalRevenue : 0,
      };
    });

    return formattedRevenueChart;
  } catch (error) {
    console.error('Error in totalRevenueAnalisys:', error);
    throw error;
  }
};


export const DashboardService = {
  totalUsers,
  totalActiveListing,
  totalSoldListing,
  totalRevenue,
  totalRevenueAnalisys,
};
