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
const getSellerHistory = async (id: string, query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Order.find({ sellerId: id }), query);
  const product = await queryBuilder
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  return { product, meta };
};
export const DashboardUserService = {
  allUser,
  singleUser,
  updateUserStatus,
  getSellerHistory,
};
