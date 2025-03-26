import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';

const createAdminToDB = async (payload: Partial<IUser>): Promise<IUser> => {
    payload.role = USER_ROLES.ADMIN;
    payload.verified = true;
    payload.status = 'active';
  const createAdmin: any = await User.create(payload);
  if (!createAdmin) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Admin');
  }
  return createAdmin;
};

const deleteAdminFromDB = async (id: any): Promise<IUser | undefined> => {
  const isExistAdmin = await User.findByIdAndDelete(id);
  if (!isExistAdmin) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete Admin');
  }
  return;
};

const getAdminFromDB = async (): Promise<IUser[]> => {
  const admins = await User.find({ role: 'ADMIN' }).select(
    'name email contactNumber profile contact role createdAt',
  );
  return admins;
};

export const AdminService = {
  createAdminToDB,
  deleteAdminFromDB,
  getAdminFromDB,
};
