"use server";

import { writeAuditLog } from "@/lib/audit";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/security/password";
import { getSystemSettings } from "@/lib/settings";

export async function registerUser(_prevState: any, formData: FormData) {
  try {
    const settings = await getSystemSettings();
    if (!settings.allowSelfRegistration) {
      return { success: false, message: "Registration is currently disabled." };
    }

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: "Email already registered." };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        status: "PENDING_APPROVAL",
      },
    });

    await writeAuditLog({
      actorUserId: user.id, // The user themselves
      action: "CREATE",
      tableName: "User",
      recordId: user.id,
      note: "Self-registration initiated",
    });

    return {
      success: true,
      message:
        "Registration successful! Your account is awaiting administrative approval.",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  }
}
