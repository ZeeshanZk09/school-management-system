/*
  Warnings:

  - A unique constraint covering the columns `[staffNumber]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[admissionNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `staffNumber` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissionNumber` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "AuthEvent" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FeeReceipt" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OneTimeToken" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RolePermission" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "capacity" INTEGER DEFAULT 30;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SiblingGroup" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "staffNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "admissionNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudentGuardian" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StudentSibling" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SystemSettings" ADD COLUMN     "allowSelfRegistration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attendanceSessions" JSONB NOT NULL DEFAULT '["Morning", "Afternoon"]';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "approvedByUserId" TEXT;

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Staff_staffNumber_key" ON "Staff"("staffNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNumber_key" ON "Student"("admissionNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
