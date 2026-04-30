import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { addGuardian, createStudent, deleteStudent } from "../actions";

jest.mock("@/lib/auth/permissions", () => ({
  requirePermission: jest.fn(),
}));

jest.mock("@/lib/audit", () => ({
  writeAuditLog: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    student: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    guardian: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    studentGuardian: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock validations
jest.mock("@/lib/validations/student", () => ({
  studentSchema: {
    safeParse: jest.fn().mockReturnValue({
      success: true,
      data: {
        fullName: "John Doe",
        dateOfBirth: "2010-01-01",
        gender: "MALE",
        admissionNumber: "STUD001",
        admissionDate: "2023-09-01",
      },
    }),
  },
}));

jest.mock("@/lib/validations/guardian", () => ({
  guardianSchema: {
    safeParse: jest.fn().mockReturnValue({
      success: true,
      data: {
        fullName: "Jane Doe",
        phoneNumber: "1234567890",
        relation: "MOTHER",
        isPrimary: true,
      },
    }),
  },
}));

describe("Student Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createStudent", () => {
    it("successfully creates a student", async () => {
      const mockUser = { id: "admin-1" };
      (requirePermission as jest.Mock).mockResolvedValue(mockUser);
      (prisma.student.create as jest.Mock).mockResolvedValue({
        id: "student-1",
        fullName: "John Doe",
      });

      const result = await createStudent({
        fullName: "John Doe",
        dateOfBirth: "2010-01-01",
        gender: "MALE",
        admissionNumber: "STUD001",
        admissionDate: "2023-09-01",
      });

      expect(requirePermission).toHaveBeenCalledWith("students.manage");
      expect(prisma.student.create).toHaveBeenCalled();
      expect(writeAuditLog).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.studentId).toBe("student-1");
    });
  });

  describe("deleteStudent", () => {
    it("performs a soft delete", async () => {
      (requirePermission as jest.Mock).mockResolvedValue({ id: "admin-1" });

      const result = await deleteStudent("student-1");

      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: "student-1" },
        data: { isDeleted: true },
      });
      expect(writeAuditLog).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/students");
      expect(result.success).toBe(true);
    });
  });

  describe("addGuardian", () => {
    it("successfully adds a guardian in a transaction", async () => {
      (requirePermission as jest.Mock).mockResolvedValue({ id: "admin-1" });

      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          const tx = {
            guardian: {
              create: jest
                .fn()
                .mockResolvedValue({ id: "guardian-1", fullName: "Jane Doe" }),
            },
            studentGuardian: {
              updateMany: jest.fn().mockResolvedValue({}),
              create: jest.fn().mockResolvedValue({}),
            },
          };
          return callback(tx);
        },
      );

      const result = await addGuardian("student-1", {
        fullName: "Jane Doe",
        phoneNumber: "1234567890",
        relation: "MOTHER",
        isPrimary: true,
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
