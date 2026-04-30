'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authenticateUser } from '@/lib/auth/authenticate';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import { loginSchema } from '@/lib/validations/auth';
import { z } from 'zod';

export type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function loginAction(_prevState: any, formData: FormData): Promise<ActionResponse> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return {
      success: false,
      message: 'Database connection string is not defined',
    };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rememberMe = formData.get('rememberMe') === 'on';

  const validatedFields = loginSchema.safeParse({
    email,
    password,
    rememberMe,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data',
      errors: z.flattenError(validatedFields.error).fieldErrors,
    };
  }

  try {
    const session = await authenticateUser({
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      rememberMe: validatedFields.data.rememberMe,
    });

    if (!session) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
    };
  }

  redirect('/');
}
