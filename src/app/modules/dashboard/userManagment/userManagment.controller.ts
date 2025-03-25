import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { DashboardUserService } from './userManagment.service';

const getAllUser = catchAsync(async (req, res) => {
  const result = await DashboardUserService.allUser(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result.users,
    pagination: result.meta,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await DashboardUserService.singleUser(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successful',
    data: result,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const result = await DashboardUserService.updateUserStatus(
    req.params.id,
    status,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User status update successfully',
    data: result,
  });
});
// get sells history
const getSellsHistory = catchAsync(async (req, res) => {
  const { userId }: any = req.body;
  const result = await DashboardUserService.getSellerHistory(userId, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sales history retrieved successfully',
    data: result.history,
    pagination: result.meta,
  });
});
// get buyer history
const getBuyerHistory = catchAsync(async (req, res) => {
  const { userId }: any = req.body;
  const result = await DashboardUserService.getBuyerHistory(userId, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Buyer history retrieved successfully',
    data: result.history,
    pagination: result.meta,
  });
});
const getUserAnalytics = catchAsync(async (req, res) => {
  const result = await DashboardUserService.getUserAnalytics(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User analytics retrieved successfully',
    data: result,
  });
});
const getTopDistricts = catchAsync(async (req, res) => {
  const result = await DashboardUserService.getTopDistricts(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Top districts retrieved successfully',
    data: result,
  });
});
export const DashboardUserController = {
  getAllUser,
  getSingleUser,
  updateStatus,
  getSellsHistory,
  getBuyerHistory,
  getUserAnalytics,
  getTopDistricts
};
