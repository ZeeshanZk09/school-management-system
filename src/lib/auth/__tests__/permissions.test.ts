import {
  requireAuth,
  requireRole,
  requirePermission,
  isTeacherForClass,
  ForbiddenError,
} from '../permissions';
import { getSessionUser } from '../session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Mock Next.js and internal dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('../session', () => ({
  getSessionUser: jest.fn(),
}));

// Mock Prisma
const mockCount = jest.fn();
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    userRole: { count: (...args: any[]) => mockCount(...args) },
    rolePermission: { count: (...args: any[]) => mockCount(...args) },
    user: { findUnique: jest.fn() },
  },
}));

describe('RBAC & Permissions', () => {
  const mockCookies = cookies as jest.Mock;
  const mockRedirect = redirect as unknown as jest.Mock;
  const mockGetSessionUser = getSessionUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('redirects to /login if no session cookie exists', async () => {
      mockCookies.mockResolvedValue({ get: () => undefined });

      await requireAuth();
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('returns user if session is valid', async () => {
      mockCookies.mockResolvedValue({ get: () => ({ value: 'valid-token' }) });
      const mockUser = { id: 'user-1', roles: [] };
      mockGetSessionUser.mockResolvedValue(mockUser);

      const user = await requireAuth();
      expect(user).toEqual(mockUser);
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('allows ADMIN regardless of allowedRoles', async () => {
      mockCookies.mockResolvedValue({ get: () => ({ value: 'token' }) });
      const mockUser = { id: 'admin', roles: ['ADMIN'] };
      mockGetSessionUser.mockResolvedValue(mockUser);

      const user = await requireRole('TEACHER');
      expect(user).toEqual(mockUser);
    });

    it('throws ForbiddenError if user lacks role', async () => {
      mockCookies.mockResolvedValue({ get: () => ({ value: 'token' }) });
      mockGetSessionUser.mockResolvedValue({ id: 'teacher', roles: ['TEACHER'] });

      await expect(requireRole('ACCOUNTANT')).rejects.toThrow(ForbiddenError);
    });

    it('allows access if user has one of the required roles', async () => {
      mockCookies.mockResolvedValue({ get: () => ({ value: 'token' }) });
      const mockUser = { id: 'acc', roles: ['ACCOUNTANT'] };
      mockGetSessionUser.mockResolvedValue(mockUser);

      const user = await requireRole('TEACHER', 'ACCOUNTANT');
      expect(user).toEqual(mockUser);
    });
  });

  describe('requirePermission', () => {
    it('allows ADMIN immediately', async () => {
      mockCookies.mockResolvedValue({ get: () => ({ value: 'token' }) });
      mockGetSessionUser.mockResolvedValue({ id: 'admin', roles: ['ADMIN'] });

      await requirePermission('finance.read');
      expect(mockCount).not.toHaveBeenCalled();
    });

    it('throws ForbiddenError if permission count is 0', async () => {
      mockCookies.mockResolvedValue({ get: () => ({ value: 'token' }) });
      mockGetSessionUser.mockResolvedValue({ id: 'teacher', roles: ['TEACHER'] });
      mockCount.mockResolvedValue(0);

      await expect(requirePermission('finance.read')).rejects.toThrow(ForbiddenError);
    });

    it('allows access if permission count > 0', async () => {
      mockCookies.mockResolvedValue({ get: () => ({ value: 'token' }) });
      mockGetSessionUser.mockResolvedValue({ id: 'teacher', roles: ['TEACHER'] });
      mockCount.mockResolvedValue(1);

      const user = await requirePermission('attendance.write');
      expect(user.id).toBe('teacher');
    });
  });

  describe('isTeacherForClass', () => {
    it('returns true for ADMIN', () => {
      const result = isTeacherForClass({ roles: ['ADMIN'] } as any, 'class-1');
      expect(result).toBe(true);
    });

    it('returns false if no assigned classes', () => {
      const result = isTeacherForClass(
        { roles: ['TEACHER'], assignedClasses: [] } as any,
        'class-1'
      );
      expect(result).toBe(false);
    });

    it('returns true if assigned to class', () => {
      const user = {
        roles: ['TEACHER'],
        assignedClasses: [{ classId: 'class-1' }],
      } as any;
      expect(isTeacherForClass(user, 'class-1')).toBe(true);
    });

    it('validates section if provided', () => {
      const user = {
        roles: ['TEACHER'],
        assignedClasses: [{ classId: 'class-1', sectionId: 'sec-1' }],
      } as any;
      expect(isTeacherForClass(user, 'class-1', 'sec-2')).toBe(false);
      expect(isTeacherForClass(user, 'class-1', 'sec-1')).toBe(true);
    });
  });
});
