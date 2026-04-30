import { recordPayment } from '../actions';
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
    feeRecord: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    feePayment: {
      create: jest.fn(),
    },
    feeReceipt: {
      create: jest.fn(),
    },
    salaryStructure: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    salarySlip: {
      create: jest.fn(),
    },
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Finance Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordPayment', () => {
    it('successfully records a valid payment', async () => {
      const mockUser = { id: 'admin-1' };
      (requirePermission as jest.Mock).mockResolvedValue(mockUser);
      
      const mockFeeRecord = {
        id: 'record-1',
        outstandingAmount: 1000,
        status: 'OPEN',
      };
      
      const mockPayment = {
        id: 'payment-1',
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        // Mocking the internal transactional prisma client
        const tx = {
          feeRecord: {
            findUnique: jest.fn().mockResolvedValue(mockFeeRecord),
            update: jest.fn().mockResolvedValue({}),
          },
          feePayment: {
            create: jest.fn().mockResolvedValue(mockPayment),
          },
          feeReceipt: {
            create: jest.fn().mockResolvedValue({ id: 'receipt-1' }),
          },
        };
        return callback(tx);
      });

      const input = {
        feeRecordId: 'record-1',
        amountPaid: 500,
        method: 'CASH',
        paidAt: '2023-10-10',
        referenceNumber: 'REF-123',
      };

      const result = await recordPayment(input);

      expect(requirePermission).toHaveBeenCalledWith('finance.manage');
      expect(result).toEqual({
        success: true,
        paymentId: 'payment-1',
        message: 'Payment recorded successfully',
      });
      expect(writeAuditLog).toHaveBeenCalled();
    });

    it('returns errors for invalid input', async () => {
      const mockUser = { id: 'admin-1' };
      (requirePermission as jest.Mock).mockResolvedValue(mockUser);

      // Missing required fields
      const input = {
        amountPaid: 500,
      };

      const result = await recordPayment(input);

      expect(result.success).toBe(false);
      // @ts-ignore
      expect(result.errors).toBeDefined();
    });
  });

  describe('generateSalarySlip', () => {
    it('successfully generates a salary slip', async () => {
      const { generateSalarySlip } = require('../payroll/actions');
      const mockUser = { id: 'admin-1' };
      (requirePermission as jest.Mock).mockResolvedValue(mockUser);

      const mockStructure = {
        id: 'struct-1',
        basePay: 50000,
        components: [
          { type: 'ALLOWANCE', amount: 5000 },
          { type: 'DEDUCTION', amount: 2000 },
        ],
      };

      (prisma.salaryStructure.findFirst as jest.Mock).mockResolvedValue(mockStructure);
      (prisma.salarySlip.create as jest.Mock).mockResolvedValue({ id: 'slip-1' });

      const result = await generateSalarySlip('staff-1', 2024, 10);

      expect(result.success).toBe(true);
      expect(prisma.salarySlip.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          grossPay: 55000,
          totalDeductions: 2000,
          netPay: 53000,
        }),
      });
    });

    it('returns error if no salary structure found', async () => {
      const { generateSalarySlip } = require('../payroll/actions');
      (requirePermission as jest.Mock).mockResolvedValue({ id: 'admin-1' });
      (prisma.salaryStructure.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await generateSalarySlip('staff-1', 2024, 10);

      expect(result.success).toBe(false);
      expect(result.message).toBe('No valid salary structure found for this period');
    });
  });
});
