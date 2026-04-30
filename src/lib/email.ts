import nodemailer from 'nodemailer';

import { decrypt } from '@/lib/security/encryption';
import prisma from '@/lib/prisma';

/**
 * Sends an email using the SMTP credentials configured in SystemSettings.
 * Returns true on success, false if SMTP is not configured or sending fails.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const settings = await prisma.systemSettings.findFirst({
      select: { smtpEmail: true, smtpAppPassword: true },
    });

    if (!settings?.smtpEmail || !settings?.smtpAppPassword) {
      console.error('[email] SMTP not configured in system settings.');
      return false;
    }

    const decryptedPassword = decrypt(settings.smtpAppPassword);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: settings.smtpEmail,
        pass: decryptedPassword,
      },
    });

    await transporter.sendMail({
      from: `"School Management System" <${settings.smtpEmail}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    return true;
  } catch (error) {
    console.error('[email] Failed to send email:', error);
    return false;
  }
}
