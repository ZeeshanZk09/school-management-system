-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ALL';

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phoneNumber" TEXT;
