import { z } from "zod";

export const classSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  code: z.string().min(1, "Code is required").max(20),
});

export const sectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  classId: z.string().min(1, "Class ID is required"),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  classTeacherId: z.string().optional().nullable(),
});
