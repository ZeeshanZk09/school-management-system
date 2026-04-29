import { z } from "zod";

export const academicYearSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    startDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Invalid start date",
    }),
    endDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Invalid end date",
    }),
    isActive: z.boolean().default(false),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });
