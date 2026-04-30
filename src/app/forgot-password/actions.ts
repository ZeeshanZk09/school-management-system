'use server';

import { createHash, randomBytes } from 'node:crypto';

import { sendEmail } from '@/lib/email';
import { env } from '@/lib/env';
import prisma from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { z } from 'zod';

export type ForgotPasswordResponse = {
  success: boolean;
  message: string;
};

export async function forgotPasswordAction(
  _prevState: ForgotPasswordResponse,
  formData: FormData
): Promise<ForgotPasswordResponse> {
  const email = formData.get('email') as string;

  const validated = forgotPasswordSchema.safeParse({ email });

  if (!validated.success) {
    return {
      success: false,
      message: z.flattenError(validated.error).fieldErrors.email?.[0] || 'Invalid email',
    };
  }

  // Always return success to prevent email enumeration
  const successMessage =
    'If an account with that email exists, a password reset link has been sent.';

  try {
    const user = await prisma.user.findUnique({
      where: { email: validated.data.email, isDeleted: false },
      select: { id: true, status: true, fullName: true },
    });

    if (user?.status !== 'ACTIVE') {
      return { success: true, message: successMessage };
    }

    // Invalidate any existing unused tokens for this user
    await prisma.oneTimeToken.updateMany({
      where: {
        identifier: user.id,
        type: 'PASSWORD_RESET',
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { consumedAt: new Date() },
    });

    // Generate a new token
    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.oneTimeToken.create({
      data: {
        identifier: user.id,
        tokenHash,
        type: 'PASSWORD_RESET',
        expiresAt,
      },
    });

    // Send the email
    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;

    await sendEmail({
      to: validated.data.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; padding: 12px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 16px;">
              <span style="font-size: 24px; color: white;">🎓</span>
            </div>
          </div>
          <h2 style="color: #1e293b; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px;">
            Password Reset
          </h2>
          <p style="color: #64748b; text-align: center; margin-bottom: 32px;">
            Hello <strong>${user.fullName}</strong>, we received a request to reset your password.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px; text-align: center;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="color: #cbd5e1; font-size: 11px; text-align: center;">
            School Management System
          </p>
        </div>
      `,
    });

    return { success: true, message: successMessage };
  } catch (error) {
    console.error('[forgot-password] Error:', error);
    return { success: true, message: successMessage };
  }
}
