import { z } from 'zod';

const createVerifyEmailZodSchema = z.object({
  body: z.object({
    emailOrPhone: z.string({ required_error: 'Email Or Phone is required' }),
    oneTimeCode: z.number({ required_error: 'One time code is required' }),
  }),
});
const createVerifyPhoneZodSchema = z.object({
  body: z.object({
    emailOrPhone: z.string({ required_error: 'Email Or Phone is required' }),
    oneTimeCode: z.string({ required_error: 'One time code is required' }),
  }),
});

const createLoginZodSchema = z.object({
  body: z.object({
    emailOrPhone: z.string({ required_error: 'Email or Phone is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const createForgetPasswordZodSchema = z.object({
  body: z.object({
    emailOrPhone: z.string({ required_error: 'Email Or Phone is required' }),
  }),
});

const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string({ required_error: 'Password is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Current Password is required',
    }),
    newPassword: z.string({ required_error: 'New Password is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

export const AuthValidation = {
  createVerifyEmailZodSchema,
  createForgetPasswordZodSchema,
  createLoginZodSchema,
  createResetPasswordZodSchema,
  createChangePasswordZodSchema,
  createVerifyPhoneZodSchema
};
