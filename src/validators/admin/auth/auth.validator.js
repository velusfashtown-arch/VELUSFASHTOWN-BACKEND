const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(6, 'New password must be at least 6 characters')
      .max(128)
      .refine((val) => val.length >= 6, 'New password must be at least 6 characters'),
  }),
});

module.exports = {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
};