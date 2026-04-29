import { createSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/security/password";

export async function authenticateUser(params: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  const user = await prisma.user.findUnique({
    where: { email: params.email, isDeleted: false },
  });

  if (!user) {
    return null;
  }

  if (user.status === "DEACTIVATED") {
    throw new Error(
      "Your account has been deactivated. Please contact the administrator.",
    );
  }

  if (user.status === "PENDING_APPROVAL") {
    throw new Error("Your account is awaiting administrative approval.");
  }

  const isValid = await verifyPassword(params.password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return createSession({
    userId: user.id,
    rememberMe: params.rememberMe,
  });
}
