import { z } from 'zod';

export const studentSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  admissionNumber: z.string().min(1, 'Admission number is required').max(50),
  rollNumber: z.string().optional().nullable(),
  dateOfBirth: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Invalid date of birth',
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED']),
  email: z.email('Invalid email').optional().nullable().or(z.literal('')),
  phoneNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'PASSED_OUT', 'WITHDRAWN']).default('ACTIVE'),
  admissionDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Invalid admission date',
  }),
});

export const studentEnrollmentSchema = z.object({
  studentId: z.string().min(1),
  academicYearId: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().min(1).optional().nullable(),
  rollNumber: z.string().min(1, 'Roll number is required'),
});
