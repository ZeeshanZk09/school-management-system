import { recordAttendance } from '../actions';
import { requirePermission } from '@/lib/auth/permissions';
import { writeAuditLog } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

jest.mock('@/lib/auth/permissions', () => ({
  requirePermission: jest.fn(),
}));

jest.mock('@/lib/audit', () => ({
  writeAuditLog: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    studentAttendance: {
      upsert: jest.fn(),
    },
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Attendance Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordAttendance', () => {
    it('successfully records bulk attendance', async () => {
      const mockUser = { id: 'user-1' };
      (requirePermission as jest.Mock).mockResolvedValue(mockUser);
      
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          studentAttendance: {
            upsert: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const data = {
        classId: 'class-1',
        sectionId: 'section-1',
        academicYearId: 'year-1',
        sessionId: 'session-1',
        attendanceDate: '2023-10-10',
        records: [
          { studentId: 'student-1', status: 'PRESENT' as const },
          { studentId: 'student-2', status: 'ABSENT' as const, note: 'Sick' },
        ],
      };

      const result = await recordAttendance(data);

      expect(requirePermission).toHaveBeenCalledWith('attendance.manage');
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(writeAuditLog).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/attendance');
      expect(result).toEqual({ success: true });
    });

    it('returns error on failure', async () => {
      (requirePermission as jest.Mock).mockResolvedValue({ id: 'user-1' });
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const data = {
        classId: 'class-1',
        sectionId: 'section-1',
        academicYearId: 'year-1',
        sessionId: 'session-1',
        attendanceDate: '2023-10-10',
        records: [],
      };

      const result = await recordAttendance(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to record attendance');
    });
  });
});
