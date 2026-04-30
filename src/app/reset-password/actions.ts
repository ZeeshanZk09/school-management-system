'use server';

import { createHash } from 'node:crypto';

import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/security/password';
import { revokeAllUserSessions } from '@/lib/auth/session';
import { newPasswordSchema } from '@/lib/validations/auth';
import { z } from 'zod';

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
  requiresApproval?: boolean;
  errors?: Record<string, string[]>;
};

/**
 * Verifies that a reset token is valid and returns user info.
 */
export async function verifyResetToken(rawToken: string): Promise<{
  valid: boolean;
  userId?: string;
  userFullName?: string;
  isAdmin?: boolean;
}> {
  if (!rawToken) {
    return { valid: false };
  }

  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  const token = await prisma.oneTimeToken.findUnique({
    where: { tokenHash },
  });

  if (!token) {
    return { valid: false };
  }

  if (token.consumedAt) {
    return { valid: false };
  }

  if (token.expiresAt <= new Date()) {
    return { valid: false };
  }

  if (token.type !== 'PASSWORD_RESET') {
    return { valid: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: token.identifier, isDeleted: false },
    select: {
      id: true,
      fullName: true,
      status: true,
      roles: {
        select: {
          role: { select: { name: true } },
        },
      },
    },
  });

  if (user?.status !== 'ACTIVE') {
    return { valid: false };
  }

  const roles = user.roles.map((r) => r.role.name);
  const isAdmin = roles.includes('ADMIN');

  return {
    valid: true,
    userId: user.id,
    userFullName: user.fullName,
    isAdmin,
  };
}

/**
 * Submits the password reset.
 * - Admin users: password changed immediately.
 * - Non-admin users: creates a PasswordResetRequest for admin approval.
 */
export async function submitPasswordReset(
  rawToken: string,
  _prevState: ResetPasswordResponse,
  formData: FormData
): Promise<ResetPasswordResponse> {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const validated = newPasswordSchema.safeParse({ password, confirmPassword });

  if (!validated.success) {
    return {
      success: false,
      message: 'Invalid form data',
      errors: z.flattenError(validated.error).fieldErrors,
    };
  }

  try {
    // Verify the token again
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const token = await prisma.oneTimeToken.findUnique({
      where: { tokenHash },
    });

    if (!token || token.consumedAt || token.expiresAt <= new Date()) {
      return {
        success: false,
        message: 'Reset link has expired or is invalid. Please request a new one.',
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: token.identifier, isDeleted: false },
      select: {
        id: true,
        status: true,
        roles: {
          select: {
            role: { select: { name: true } },
          },
        },
      },
    });

    if (user?.status !== 'ACTIVE') {
      return {
        success: false,
        message: 'Account not found or inactive.',
      };
    }

    const roles = user.roles.map((r) => r.role.name);
    const isAdmin = roles.includes('ADMIN');
    const newPasswordHash = await hashPassword(validated.data.password);

    // Consume the token
    await prisma.oneTimeToken.update({
      where: { id: token.id },
      data: { consumedAt: new Date() },
    });

    if (isAdmin) {
      // Admin: update password immediately
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      });

      // Revoke all existing sessions
      await revokeAllUserSessions(user.id, 'PASSWORD_CHANGED');

      return {
        success: true,
        message: 'Your password has been reset successfully. You can now log in.',
      };
    }

    // Non-admin: create a pending approval request
    // Cancel any existing pending requests
    await prisma.passwordResetRequest.updateMany({
      where: {
        userId: user.id,
        status: 'PENDING_APPROVAL',
      },
      data: {
        status: 'EXPIRED',
      },
    });

    await prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        newPasswordHash,
        status: 'PENDING_APPROVAL',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      },
    });

    return {
      success: true,
      requiresApproval: true,
      message:
        'Your password reset request has been submitted. An administrator will review and approve it. You will be able to log in once approved.',
    };
  } catch (error) {
    console.error('[reset-password] Error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
