import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyPhone,
} from '../../../types/auth';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import AppError from '../../../errors/AppError';
import generateOTP from '../../../utils/generateOTP';
import cryptoToken from '../../../utils/cryptoToken';
import { verifyToken } from '../../../utils/verifyToken';
import { createToken } from '../../../utils/createToken';
import { twilioService } from '../../builder/TwilioService';

//login
const login = async (payload: ILoginData) => {
  const { emailOrPhone, password } = payload;

  // Detect if input is email or phone number
  const query = emailOrPhone.includes('@')
    ? { email: emailOrPhone }
    : { contactNumber: emailOrPhone };

  const isExistUser = await User.findOne(query).select('+password');
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Check verified and status
  if (!isExistUser.verified) {
    // Generate OTP
    const otp = generateOTP(4);

    if (emailOrPhone.includes('@')) {
      const value = {
        otp,
        email: isExistUser.email,
      };
      const forgetPassword = emailTemplate.resetPassword(value);
      emailHelper.sendEmail(forgetPassword);
    } else {
      // Send SMS OTP - assuming you have an SMS service
      await twilioService.sendOTP(isExistUser?.contactNumber, otp);
    }

    // Save OTP to DB
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60000),
    };

    // Fix: Use the proper query object instead of {query}
    await User.findOneAndUpdate(query, { $set: { authentication } });

    throw new AppError(
      StatusCodes.CONFLICT,
      'Please verify your account, then try to login again',
    );
  }

  // Check user status
  if (isExistUser?.status === 'blocked') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You don't have permission to access this content. It looks like your account has been blocked.",
    );
  }

  // Check match password
  if (
    password &&
    !(await User.isMatchPassword(password, isExistUser.password))
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  // Prepare JWT data with additional fields
  const jwtData = {
    id: isExistUser._id,
    role: isExistUser.role,
    email: isExistUser.email,
    contactNumber: isExistUser.contactNumber,
  };

  // Create tokens
  const accessToken = jwtHelper.createToken(
    jwtData,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  const refreshToken = jwtHelper.createToken(
    jwtData,
    config.jwt.jwt_refresh_secret as string,
    config.jwt.jwt_refresh_expire_in as string,
  );

  return { accessToken, refreshToken };
};

//forget password
const forgetPasswordToDB = async (emailOrPhone: string) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
  // Check if the user exists based on the input type
  let isExistUser;
  if (isEmail) {
    isExistUser = await User.isExistUserByEmail(emailOrPhone);
  } else {
    isExistUser = await User.isExistUserByPhone(emailOrPhone);
  }

  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Generate OTP
  const otp = generateOTP(4);
  // Determine and execute the appropriate OTP delivery method
  if (isEmail && isExistUser?.email) {
    // Send OTP via email
    const value = {
      otp,
      email: isExistUser.email,
    };
    const forgetPassword = emailTemplate.resetPassword(value);
    await emailHelper.sendEmail(forgetPassword);
  } else if (isExistUser?.contactNumber) {
    // Send OTP via Twilio SMS
    await twilioService.sendOTP(isExistUser?.contactNumber, otp);
  } else {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'No valid contact method found for this user',
    );
  }

  // Save OTP to DB - use the appropriate field for the query
  const queryField = isEmail
    ? { email: emailOrPhone }
    : { conatctNumber: emailOrPhone };
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };

  await User.findOneAndUpdate(queryField, { $set: { authentication } });

  return;
};
// resend Otp
const resendOtpFromDb = async (emailOrPhone: string) => {
  // Determine if input is email or phone
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);

  // Check if the user exists based on the input type
  let isExistUser;
  console.log(emailOrPhone);
  if (isEmail) {
    isExistUser = await User.isExistUserByEmail(emailOrPhone);
  } else {
    isExistUser = await User.isExistUserByPhone(emailOrPhone);
  }

  if (!isExistUser || !isExistUser?._id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Generate OTP
  const otp = generateOTP(4);

  // Determine and execute the appropriate OTP delivery method
  if (isEmail && isExistUser?.email) {
    // Send OTP via email
    const values = {
      name: isExistUser.name,
      otp: otp,
      email: isExistUser.email,
    };
    const createAccountTemplate = emailTemplate.createAccount(values);
    await emailHelper.sendEmail(createAccountTemplate);
  } else if (isExistUser?.contactNumber) {
    // Send OTP via Twilio SMS
    await twilioService.sendOTP(isExistUser?.contactNumber, otp);
  } else {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'No valid contact method found for this user',
    );
  }

  // Save OTP to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };

  await User.findOneAndUpdate(
    { _id: isExistUser?._id },
    { $set: { authentication } },
  );

  return;
};
//forget password by email url
const forgetPasswordByUrlToDB = async (email: string) => {
  // Check if the user exists
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser || !isExistUser._id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Check if the user is blocked
  if (isExistUser.status === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This user is blocked!');
  }

  // Generate JWT token for password reset valid for 10 minutes
  const jwtPayload = {
    id: isExistUser._id,
    email: isExistUser.email,
    role: isExistUser.role,
  };
  const resetToken = createToken(
    jwtPayload,
    config.jwt.jwt_secret as string,
    config.reset_pass_expire_time as string,
  );

  // Construct password reset URL
  const resetUrl = `${config.reset_pass_ui_link}/auth/login/set_password?email=${isExistUser.email}&token=${resetToken}`;

  // Prepare email template
  const forgetPasswordEmail = emailTemplate.resetPasswordByUrl({
    email: isExistUser.email,
    resetUrl,
  });

  // Send reset email
  await emailHelper.sendEmail(forgetPasswordEmail);
};

//verify email
const verifyPhoneToDB = async (payload: IVerifyPhone) => {
  const { emailOrPhone, oneTimeCode } = payload;
  // Determine if input is email or phone
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
  const query = isEmail
    ? { email: emailOrPhone }
    : { contactNumber: emailOrPhone };
  const isExistUser = await User.findOne(query).select('+authentication');
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (!oneTimeCode) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your email we send a code',
    );
  }

  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again',
    );
  }

  let message;
  let verifyToken;
  let accessToken;
  let user;
  if (!isExistUser.verified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      { verified: true, authentication: { oneTimeCode: null, expireAt: null } },
    );
    //create token
    accessToken = jwtHelper.createToken(
      { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string,
    );
    message = 'Email verify successfully';
    user = await User.findById(isExistUser._id);
  } else {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        authentication: {
          isResetPassword: true,
          oneTimeCode: null,
          expireAt: null,
        },
      },
    );

    //create token ;
    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000),
    });
    message =
      'Verification Successful: Please securely store and utilize this code for reset password';
    verifyToken = createToken;
  }
  return { verifyToken, message, accessToken, user };
};

//reset password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword,
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication',
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'",
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password',
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!",
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};
// reset password by url
const resetPasswordByUrl = async (
  token: string,
  payload: IAuthResetPassword,
) => {
  const { newPassword, confirmPassword } = payload;
  let decodedToken;
  try {
    decodedToken = await verifyToken(token, config.jwt.jwt_secret as Secret);
  } catch (error) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token.');
  }
  const { id } = decodedToken;
  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User not found.');
  }

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password don't match!",
    );
  }

  // Hash New Password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  // Update Password
  await User.findByIdAndUpdate(
    id,
    {
      password: hashPassword,
      authentication: { isResetPassword: false },
    },
    { new: true, runValidators: true },
  );

  // Return Success Response
  return {
    message:
      'Password reset successful. You can now log in with your new password.',
  };
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword,
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password',
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched",
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updateData = {
    password: hashPassword,
  };
  const result = await User.findOneAndUpdate({ _id: user.id }, updateData, {
    new: true,
  });
  return result;
};
// Refresh token
const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Token not found');
  }

  const decoded = verifyToken(
    token,
    config.jwt.jwt_refresh_expire_in as string,
  );

  const { id } = decoded;

  const activeUser = await User.findById(id);
  if (!activeUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (activeUser.status !== 'active') {
    throw new AppError(StatusCodes.FORBIDDEN, 'User account is inactive');
  }
  if (!activeUser.verified) {
    throw new AppError(StatusCodes.FORBIDDEN, 'User account is not verified');
  }
  if (activeUser.isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, 'User account is deleted');
  }

  const jwtPayload = {
    id: activeUser?._id?.toString() as string,
    role: activeUser?.role,
    email: activeUser.email,
  };

  const accessToken = jwtHelper.createToken(
    jwtPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  return {
    accessToken,
  };
};
export const AuthService = {
  verifyPhoneToDB,
  login,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  forgetPasswordByUrlToDB,
  resetPasswordByUrl,
  resendOtpFromDb,
  refreshToken,
};
