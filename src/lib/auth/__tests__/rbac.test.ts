import { ForbiddenError, requireRole, requirePermission } from '../permissions';
import { getSessionUser } from '../session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { unknown } from 'zod';

jest.mock('next/headers');
jest.mock('next/navigation');
jest.mock('../session');
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    userRole: {
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    rolePermission: {
      count: jest.fn(),
    },
  },
}));

describe('RBAC Permissions', () => {
  const mockCookies = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockResolvedValue(mockCookies);
    mockCookies.get.mockReturnValue({ value: 'mock-token' });
  });

  describe('requireRole', () => {
    it('allows ADMIN to access anything', async () => {
      const mockUser = { id: '1', roles: ['ADMIN'], fullName: 'Admin' };
      (getSessionUser as jest.Mock).mockResolvedValue(mockUser);

      const user = await requireRole('TEACHER');
      expect(user).toEqual(mockUser);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('allows user with correct role', async () => {
      const mockUser = { id: '2', roles: ['TEACHER'], fullName: 'Teacher' };
      (getSessionUser as jest.Mock).mockResolvedValue(mockUser);

      const user = await requireRole('TEACHER');
      expect(user).toEqual(mockUser);
    });

    it('throws ForbiddenError for incorrect role', async () => {
      const mockUser = { id: '3', roles: ['TEACHER'], fullName: 'Teacher' };
      (getSessionUser as jest.Mock).mockResolvedValue(mockUser);

      await expect(requireRole('ADMIN')).rejects.toThrow(ForbiddenError);
    });

    it('redirects to login if not authenticated', async () => {
      mockCookies.get.mockReturnValue(null);
      (getSessionUser as jest.Mock).mockResolvedValue(null);

      // Mock redirect to throw so requireAuth stops
      (redirect as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('Redirected');
      });

      await expect(requireRole('ADMIN')).rejects.toThrow('Redirected');
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('requirePermission', () => {
    it('allows ADMIN regardless of permission records', async () => {
      const mockUser = { id: '1', roles: ['ADMIN'], fullName: 'Admin' };
      (getSessionUser as jest.Mock).mockResolvedValue(mockUser);

      const user = await requirePermission('finance.manage');
      expect(user).toEqual(mockUser);
      expect(prisma.userRole.count).not.toHaveBeenCalled();
    });

    it('checks database for non-admin permissions', async () => {
      const mockUser = { id: '2', roles: ['ACCOUNTANT'], fullName: 'Accountant' };
      (getSessionUser as jest.Mock).mockResolvedValue(mockUser);
      (prisma.userRole.count as jest.Mock).mockResolvedValue(1);

      const user = await requirePermission('finance.manage');
      expect(user).toEqual(mockUser);
      expect(prisma.userRole.count).toHaveBeenCalled();
    });

    it('throws ForbiddenError if permission not found', async () => {
      const mockUser = { id: '2', roles: ['ACCOUNTANT'], fullName: 'Accountant' };
      (getSessionUser as jest.Mock).mockResolvedValue(mockUser);
      (prisma.userRole.count as jest.Mock).mockResolvedValue(0);

      await expect(requirePermission('admin.access')).rejects.toThrow(ForbiddenError);
    });
  });
});
