import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { DashboardService } from './dashboard.service';

const totalAnalysis = catchAsync(async (req, res) => {
  const filter = Array.isArray(req.query.filter)
    ? req.query.filter[0]
    : req.query.filter;
  const filterString = filter ? String(filter) : 'allTime';

  const totalUsers = await DashboardService.totalUsers(filterString);
  const totalActiveListing =
    await DashboardService.totalActiveListing(filterString);
  const totalSoldListing =
    await DashboardService.totalSoldListing(filterString);
  const totalRevenue = await DashboardService.totalRevenue(filterString);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Total analysis retrieved successfully',
    data: {
      totalUsers,
      totalActiveListing,
      totalSoldListing,
      totalRevenue,
    },
  });
});

const totalRevenue = catchAsync(async (req, res) => {
  const result = await DashboardService.totalRevenueAnalisys();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Total revenue retrieved successfully',
    data: result,
  });
});
export const DashboardController = {
  totalAnalysis,
};
