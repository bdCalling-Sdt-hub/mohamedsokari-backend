import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import unlinkFile from '../../../shared/unlinkFile';
import { IUser } from './user.interface';
import { User } from './user.model';
import AppError from '../../../errors/AppError';
import { USER_ROLES } from '../../../enums/user';
import generateOTP from '../../../utils/generateOTP';
import { twilioService } from '../../builder/TwilioService';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';


// create user
const createUserToDB = async (payload: IUser): Promise<IUser> => {
  // Detect if input is email or phone number

  if (payload.email.includes('@')) {
    const existingUser = await User.isExistUserByEmail(payload.email);
    if (existingUser) {
      throw new AppError(StatusCodes.CONFLICT, 'Email already exists');
    }
  } else {
    const existingUser = await User.isExistUserByPhone(payload.contactNumber);
    if (existingUser) {
      throw new AppError(StatusCodes.CONFLICT, 'Phone number already exists');
    }
  }

  // Set role
  payload.role = USER_ROLES.USER;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }
  // Generate OTP
  const otp = generateOTP(4);

  // Send OTP via Email if email is provided, else send via Twilio SMS
  if (createUser.email) {
    const values = {
      name: createUser.name,
      otp: otp,
      email: createUser.email!,
    };
    const registrationEmail = emailTemplate.createAccount(values);
    emailHelper.sendEmail(registrationEmail);
  } else {
    console.log("sending otp to twilio");
    await twilioService.sendOTP(createUser.contactNumber, otp);
  }

  // Save OTP to DB with expiry of 3 minutes
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000), // 3 minutes expiry
  };

  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } },
  );

  return createUser;
};

// get user profile
const getUserProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

// update user profile
const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const verifyUserPassword = async (userId: string, password: string) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }
  const isPasswordValid = await User.isMatchPassword(password, user.password);
  return isPasswordValid;
};
const deleteUser = async (id: string) => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  await User.findByIdAndUpdate(id, {
    $set: { isDeleted: true },
  });

  return true;
};
export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  deleteUser,
  verifyUserPassword,
};
