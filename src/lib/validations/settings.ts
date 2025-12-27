import { z } from 'zod';

// Account settings
export const accountSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  language: z.string(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

// Privacy settings
export const privacySchema = z.object({
  profileVisibility: z.enum(['public', 'followers', 'private']),
  showOnlineStatus: z.boolean(),
  allowMessages: z.enum(['everyone', 'followers', 'nobody']),
  showActivityStatus: z.boolean(),
});

export type PrivacyFormData = z.infer<typeof privacySchema>;

// Notification settings
export const notificationSchema = z.object({
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  newFollower: z.boolean(),
  postLike: z.boolean(),
  postComment: z.boolean(),
  commentReply: z.boolean(),
  newMessage: z.boolean(),
  threadReply: z.boolean(),
  listingInquiry: z.boolean(),
});

export type NotificationFormData = z.infer<typeof notificationSchema>;

// Password change
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PasswordFormData = z.infer<typeof passwordSchema>;

// Delete account
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete your account'),
  reason: z.string().optional(),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Please type DELETE to confirm' }),
  }),
});

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
