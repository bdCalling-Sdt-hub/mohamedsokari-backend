import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
export interface IReview {
  userId: Types.ObjectId;
  rating: number;
  comment: string;
  date: Date;
}
export type IUser = {
  name: string;
  role: USER_ROLES;
  contactNumber: string;
  location: string;
  email: string;
  password: string;
  image?: string;
  isDeleted: boolean;
  address: string;
  status: 'active' | 'blocked';
  verified: boolean;
  reviews: IReview[];
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModel = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isExistUserByPhone(contact: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
