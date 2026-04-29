import { z } from "zod";

export const staffSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  staffNumber: z.string().min(1, "Staff number is required").max(50),
  designation: z.string().min(1, "Designation is required").max(100),
  department: z.string().min(1, "Department is required").max(100),
  dateOfBirth: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid date of birth",
  }),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNSPECIFIED"]),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  employmentType: z
    .enum(["PERMANENT", "CONTRACT", "PART_TIME"])
    .default("PERMANENT"),
  joiningDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid joining date",
  }),
  qualification: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  baseSalary: z.coerce.number().min(0, "Salary cannot be negative"),
});
