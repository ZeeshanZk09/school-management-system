import { z } from 'zod';

export const guardianSchema = z.object({
  fullName: z.string().min(2, 'Name is required').max(100),
  relation: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.email('Invalid email').optional().nullable().or(z.literal('')),
  occupation: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false),
});
